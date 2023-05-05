<template>
	<view v-for="item of fileList" class="file-item" @click="onFileSelected(item)">
		<view class=""><image :src="fileType(item.name)" class="icon" mode="widthFix"></image></view>
		<view class="item-content">
			<text>{{ item.name }}</text>
			<text class="item-content-text">{{ getSize(item.size) }}</text>
			<text>{{ getData(item.time) }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import pdf from '../../static/icon_pdf.png';
import word from '../../static/icon_word.png';

let main = plus.android.runtimeMainActivity();

const fileList = ref<any[]>([]);
const stack = ref<string[]>([]);

function fileType(type: string) {
	return /.docx$/.test(type) ? word : pdf;
}

function onFileSelected(item) {
	if (item.size > 25 * 10 ** 6) return
	// 将文件复制到公共目录
	copyFileByUri(item);
}

const onUpload = files => {
	console.log('=====file.value====', files);
	uni.uploadFile({
		url: 'http://192.168.6.240:8080/file',
		filePath: files,
		name: 'file', //后台接收字段名
		success: res => {
			console.log('请求成功_______________', res);
			if (res.status === 200) {
				uni.navigateBack();
			}
		},
		fail: err => {
			console.log('请求失败_______________', err);
		},
		complete: () => {
			console.log('结束了----');
		}
	});
};

function getData(data) {
	let date = new Date(data);
	let year = date.getFullYear();
	let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
	let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
	let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
	let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
	let seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

	return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function getSize(value: number) {
	if (value > 1000000) return (value / 1000000).toFixed(1) + 'MB';
	else if (value > 1000) return Math.floor(value / 1000).toFixed(1) + 'KB';
	else if (value < 1000) return value + 'B';
}

function pathToUri(path, Uri) {
	return Uri.parse(
		'content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata/document/primary%3A' + path.replace('/storage/emulated/0/', '').replace('/', '%2F')
	);
}

function copyTet(pathUri) {
	console.log('pathUri', pathUri);
	let pathUrl = '/log.txt'; //指定文件路径
	let environment = plus.android.importClass('android.os.Environment');
	var sdRoot = environment.getExternalStorageDirectory(); //文件夹根目录
	var File = plus.android.importClass('java.io.File');
	var BufferedReader = plus.android.importClass('java.io.BufferedReader');
	var FileReader = plus.android.importClass('java.io.FileReader');
	var FileWriter = plus.android.importClass('java.io.FileWriter');
	var FileInputStream = plus.android.importClass('java.io.FileInputStream');
	var FileOutputStream = plus.android.importClass('java.io.FileOutputStream');

	let contentResolver = main.getContentResolver();
	plus.android.importClass(contentResolver);

	// /storage/emulated/0/Android/data/com.tencent.mm/MicroMsg/Download/iim.txt
	// '/Android/data/com.tencent.mm/MicroMsg/Download/iim.txt'
	console.log('sdRoot', sdRoot);
	let readFr = new File(sdRoot + pathUrl);
	let txt = '';
	try {
		var reader = new BufferedReader(new FileReader(readFr));
		console.log('reader', reader);
		// 我的需求是读取多行,所以把每行都读出来存在数组里
		let arr = [];
		let txt;
		while ((txt = reader.readLine()) != null) {
			console.log('txt', txt);
			arr.push(txt);
		}
		// 传入回调处理你的业务
		console.log('arr', arr);
		//处理业务逻辑
	} catch (e) {
		console.log('eeee', e);
	}
}

function copyFileByUri(item) {
	// const Uri = plus.android.importClass('android.net.Uri');
	// var String = plus.android.importClass('java.lang.String');
	// var byteClass = plus.android.importClass('java.type');
	// let Environment = plus.android.importClass('android.os.Environment');
	// const DocumentFile = plus.android.importClass('androidx.documentfile:documentfile:1.0.1');
	plus.android.importClass('java.io.FileInputStream');
	// var File = plus.android.importClass('java.io.File');
	var FileReader = plus.android.importClass('java.io.FileReader');
	var FileWriter = plus.android.importClass('java.io.FileWriter');
	var BufferedReader = plus.android.importClass('java.io.BufferedReader');
	var FileOutputStream = plus.android.importClass('java.io.FileOutputStream');
	var InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
	var Channels = plus.android.importClass('java.nio.channels.Channels');

	let FileChannel = plus.android.importClass('java.nio.channels.FileChannel');

	let contentResolver = main.getContentResolver();
	plus.android.importClass(contentResolver);

	let inputStream = null;
	let fileOutputStream = null;
	try {
		inputStream = contentResolver.openInputStream(item.pathUri.getUri());

		console.log('size====', inputStream.available());
		fileOutputStream = new FileOutputStream('/storage/emulated/0/Download/' + item.name);

		let byteRead = 0;
		// while ((byteRead = inputStream.read()) != -1 && byteRead != null) {
		// 	fileOutputStream.write(byteRead);
		// }
		let buf = new Int8Array(497);
		let str = 0;
		// while ((str = inputStream.read(buf)) != -1 && str != null) {
		// 	fileOutputStream.write(buf);
		// }
		// fileOutputStream.write(inputStream);
		console.log('FileCopyUtil', new FileChannel().FileCopyUtil);
		FileChannel.copy(inputStream, fileOutputStream);
		// let string = new String(buffer, 0, 1024, 'UTF-8');
		inputStream.close();
		fileOutputStream.flush();
		fileOutputStream.close();
		console.log('结束了');
	} catch (e) {
		//TODO handle the exception
		console.log('错误', e);
		// e.printStackTrace();
	}
}
// 目前还无法读取文件内容
function weixinPathList() {
	const weixinPath = '/storage/emulated/0/Android/data/com.tencent.mm/MicroMsg/Download';
	const Uri = plus.android.importClass('android.net.Uri');
	const DocumentFile = plus.android.importClass('androidx.documentfile.provider.DocumentFile');
	var File = plus.android.importClass('java.io.File');

	const documentFile = DocumentFile.fromTreeUri(main, pathToUri(weixinPath, Uri));
	// let documentFile = DocumentFile.fromSingleUri(main,Uri);

	console.log('documentFile--', documentFile.isDirectory(), documentFile.listFiles(), documentFile.getName());
	if (documentFile.isDirectory()) {
		// 不能通过DocumentFile.fromTreeUri直接到Download目录，所以手动循环到该目录，
		// listFiles 方法是获取 documentFile 目录下所有文件和文件夹
		let documentFiles = documentFile.listFiles();
		let documentFile2 = null;
		for (let file of documentFiles) {
			if (file.getName() == 'com.tencent.mm') {
				documentFile2 = file;
				break;
			}
		}
		// console.log('documentFile2', documentFile2.listFiles());
		let documentFile3 = null;
		for (let listFile of documentFile2.listFiles()) {
			if (listFile.getName() == 'MicroMsg') {
				documentFile3 = listFile;
				break;
			}
		}

		// console.log('documentFile3', documentFile3.listFiles());
		let documentFile4 = null;
		for (let listFile of documentFile3.listFiles()) {
			if (listFile.getName() == 'Download') {
				documentFile4 = listFile;
				break;
			}
		}
		// console.log('documentFile4', documentFile4.listFiles());

		for (let item of documentFile4.listFiles()) {
			if (item.isDirectory()) continue;

			let json = {
				name: '',
				type: '',
				time: '',
				size: '',
				path: '',
				pathUri: null
			};
			json.type = 'file';
			json.name = item.getName();
			json.size = item.length();
			json.path = weixinPath + '/' + item.getName();
			json.time = item.lastModified();
			json.pathUri = item;
			fileList.value.push(json);
			// console.log(item.getName(),item.length(), item.getUri(), item.lastModified());
		}
	}
}

// 安卓10 以下版本
function getPrivateDir(dirPath: string) {
	console.log('dirPath: ', dirPath);
	// 导入 java.io.File 类
	var File = plus.android.importClass('java.io.File');

	// 创建 File 对象，指定目录路径
	var dir = new File(dirPath);

	// 判断目录是否存在
	if (dir.exists()) {
		// 获取目录下的文件列表
		var files = dir.listFiles();
		if (files != null) {
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
					console.log('文件目录名: ' + dirName);
					// console.log('文件目录路径: ' + dirPath);
					if (/^\./.test(dirName)) continue;
					json.type = 'dir';
					json.path = dirPath;
					json.name = dirName;
					fileList.value.push(json);
				} else {
					// 处理文件
					let fileName = file.getName();
					let fileSize = file.length();
					let filePath = file.getAbsolutePath();

					if (/^\./.test(fileName)) continue;
					// console.log('文件名: ' + fileName);
					// console.log('文件路径: ' + filePath);
					// console.log("文件大小: " + fileSize + " 字节");

					json.type = 'file';
					json.name = fileName;
					json.size = fileSize;
					json.path = filePath;
					json.time = file.lastModified();
					fileList.value.push(json);
				}
			}
		}
	} else {
		console.log('目录不存在');
	}
}

onMounted(() => {
	weixinPathList();
});
</script>

<style lang="scss" scoped>
.file-item {
	// flex py-2 items-center border-0 border-b border-solid border-[#e7e7e7]
	display: flex;
	padding: 20rpx;
	align-items: center;
	border-bottom: 1px solid #e7e7e7;
	.icon {
		// w-[50px] ml-2
		width: 50rpx;
		margin-left: 20rpx;
	}
	.item-content {
		// flex flex-col pl-3
		display: flex;
		flex-direction: column;
		padding-left: 26rpx;
		.item-content-text {
			// my-[6px]
			margin: 12rpx;
		}
	}
}
</style>
