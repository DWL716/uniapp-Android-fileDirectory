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
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { onLoad, onReady, onShow } from '@dcloudio/uni-app';
import pdf from '../../static/icon_pdf.png';
import word from '../../static/icon_word.png';
import { getData, getSize } from '../../utils/index.js'

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
function getPrivateDir(dirPath: string) {
	uni.showLoading({
		title: '加载中'
	});
	
	// 创建 File 对象，指定目录路径
	let dir = new File(dirPath);

	// 判断目录是否存在
	if (!dir.exists()) return console.log('目录不存在');

	// 获取目录下的文件列表
	var files = dir.listFiles();
	if (files == null) return uni.hideLoading();;

	const lists = [];

	// 遍历文件列表
	for (var i = 0; i < files.length; i++) {
		let json = {
			name: '',
			type: '',
			time: '',
			size: '',
			path: ''
		};
		var file = files[i];
		// 判断是文件还是文件目录
		if (file.isDirectory()) {
			// 处理文件目录
			let dirName = file.getName();
			let dirPath = file.getAbsolutePath();
			if (/^\./.test(dirName)) continue;
			json.type = 'dir';
			json.path = dirPath;
			json.name = dirName;
			// fileList.value.push(json);
			lists.push(json);
		} else {
			// 处理文件
			let fileName = file.getName();
			let fileSize = file.length();
			let filePath = file.getAbsolutePath();

			if (/^\./.test(fileName)) continue;

			json.type = 'file';
			json.name = fileName;
			json.size = fileSize;
			json.path = filePath;
			json.time = file.lastModified();
			// fileList.value.push(json);
			lists.push(json);
		}
	}

	fileList.value = lists;

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
