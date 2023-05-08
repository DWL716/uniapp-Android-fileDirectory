<template>
	<view v-if="stack.length > 1" class="file-item" @click="openParent(stackLaset)">
		<view class=""><image src="../../static/phone.png" class="icon" mode="widthFix"></image></view>
		<view class="item-content"><text>...上一层</text></view>
	</view>
	<view v-for="item of fileList" @click="onFileSelected(item)" class="file-item">
		<view class="">
			<image v-if="item.type === 'file'" :src="fileType(item.name)" class="icon" mode="widthFix"></image>
			<image v-else src="../../static/phone.png" class="icon" mode="widthFix"></image>
		</view>
		<view class="item-content">
			<text>{{ item.name }}</text>
			<text v-if="item.type === 'file'" class="item-content-text">{{ getSize(item.size) }}</text>
			<text v-if="item.type === 'file'">{{ getData(item.time) }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onLoad, onReady, onShow } from '@dcloudio/uni-app';
import pdf from '../../static/icon_pdf.png';
import word from '../../static/icon_word.png';
import { getData, getSize } from '../../utils/index.js';

// 导入 java.io.File 类
const File = plus.android.importClass('java.io.File');

const fileList = ref<any[]>([]);
const stack = ref<string[]>([]);

function fileType(type: string) {
	return /.docx$/.test(type) ? word : pdf;
}

const stackLaset = computed(() => {
	return {
		type: 'dir',
		path: stack.value[stack.value.length - 2]
	};
});

const openParent = item => {
	stack.value = stack.value.slice(0, stack.value.length - 1);
	fileList.value = [];
	getPrivateDir(item.path);
};
function onFileSelected(item) {
	if (item.type === 'dir') {
		stack.value.push(item.path);
		fileList.value = [];
		getPrivateDir(item.path);
	} else {
		console.log('选中的文件', item);
	}
}

// 核心功能 通过 File 类来获取当前目录列表
// 测试安卓版本 8.x 、小米11 安卓12
// 获取手机根目录无法通过 plus.io.resolveLocalFileSystemURL 获取，会报错 https://ask.dcloud.net.cn/article/36199
function getPrivateDir(dirPath: string) {
	uni.showLoading({
		title: '加载中'
	});

	plus.io.resolveLocalFileSystemURL(
		dirPath,
		entry => {
			var directoryReader = entry.createReader(); //获取读取目录对象
			directoryReader.readEntries(
				 (entries: any[]) => {
					let lists = [];
					// stack.value.length > 1 && fileList.value.push({ name: '...上一层', type: 'dir', path: stack.value[stack.value.length - 2] });
					//返回的是指定文件夹下的文件列表和                                    uni.getSavedFileList(OBJECT)效果一样
					for (let i = 0; i < entries.length; i++) {
						let json = {
							name: entries[i].name,
							type: 'file',
							time: '',
							size: '',
							path: entries[i].fullPath
						};
						// console.log(entries[i].fullPath, entries[i].fileSystem, Object.keys(entries[i]));
						if (entries[i].isFile) {
							// 获取文件的属性信息
							entries[i].getMetadata(
								function(metadata) {
									json['time'] = metadata.modificationTime;
									json['size'] = metadata.size;
									fileList.value.push(json)
								},
								function() {
									alert('获取文件信息失败');
								}
							);
						} else if (entries[i].isDirectory && !/^\./.test(entries[i].name)) {
							json.type = 'dir';
							fileList.value.push(json)
							// console.log('目录', entries[i].isDirectory, entries[i].name);
						}
					}
				},
				err => {
					console.log('访问目录失败: ', err);
				}
			);
		},
		err => {
			console.log('访问指定目录失败:' + err.message);
		}
	);

	uni.hideLoading();
}

onMounted(() => {
	var dirPath = '/storage/emulated/0/';
	stack.value.push(dirPath);
	getPrivateDir(dirPath);
});
</script>

<style lang="scss" scoped>
.file-item {
	display: flex;
	padding: 20rpx;
	align-items: center;
	border-bottom: 1px solid #e7e7e7;
	.icon {
		width: 50rpx;
		margin-left: 20rpx;
	}
	.item-content {
		display: flex;
		flex-direction: column;
		padding-left: 26rpx;
		.item-content-text {
			margin: 12rpx;
		}
	}
}
</style>
