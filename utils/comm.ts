export function systemFileManager() {
	// 参考: http://www.cnblogs.com/panhouye/archive/2017/04/23/6751710.html
	let main = plus.android.runtimeMainActivity();
	let Intent = plus.android.importClass('android.content.Intent');

	// #ifdef APP-PLUS
	if (plus.os.name.toLowerCase() != 'android') {
		uni.showModal({
			title: '提示',
			content: '仅支持Android平台',
			success: function(res) {}
		});
		return false;
	}

	let fileIntent = new Intent(Intent.ACTION_GET_CONTENT);
	//fileIntent.setType(“image/*”);//选择图片
	//fileIntent.setType(“audio/*”); //选择音频
	//fileIntent.setType(“video/*”); //选择视频 （mp4 3gp 是android支持的视频格式）
	//fileIntent.setType(“video/*;image/*”);//同时选择视频和图片
	fileIntent.setType('*/*'); //无类型限制
	fileIntent.addCategory(Intent.CATEGORY_OPENABLE);
	main.startActivityForResult(fileIntent, 1);
	// 获取回调
	main.onActivityResult = function(requestCode, resultCode, data) {
		let Activity = plus.android.importClass('android.app.Activity');
		let ContentUris = plus.android.importClass('android.content.ContentUris');
		let Cursor = plus.android.importClass('android.database.Cursor');
		let Uri = plus.android.importClass('android.net.Uri');
		let Build = plus.android.importClass('android.os.Build');
		let Environment = plus.android.importClass('android.os.Environment');
		let DocumentsContract = plus.android.importClass('android.provider.DocumentsContract');
		let MediaStore = plus.android.importClass('android.provider.MediaStore');

		var BufferedReader = plus.android.importClass('java.io.BufferedReader');
		var FileReader = plus.android.importClass('java.io.FileReader');
		var InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
		var FileOutputStream = plus.android.importClass('java.io.FileOutputStream');
		var File = plus.android.importClass('java.io.File');

		plus.android.importClass('java.io.FileInputStream');

		// 给系统导入 contentResolver
		let contentResolver = main.getContentResolver();
		plus.android.importClass(contentResolver);
		// 返回路径
		let path = '';
		if (resultCode == Activity.RESULT_OK) {
			let uri = data.getData();
			let src = uri.getPath();
			let source = new File(src);
			console.log(data, uri, src, source.toString());
			
			// 这里是文件复制
			/**
			try {
				// let  reader = new BufferedReader(new FileReader(InputStream));
				let sourceUri = Uri.fromFile(new File(uri));
				let InputStream = contentResolver.openInputStream(uri);
				console.log('len==1', InputStream.available());
			
				//
				let file = new File('/storage/emulated/0/aaabbb.txt');
			
				let fileOutputStream = new FileOutputStream(file);
			
				let len = 0;
				let sum = 0;
				while ((len = InputStream.read()) != -1) {
					// fos.write(buf, 0, len);
					fileOutputStream.write(len);
					sum += len;
				}
				//
			
				let arr = [];
				let txt;
			
				// while ((txt = reader.readLine()) != null) {
				// 	console.log('txt', txt);
				//     arr.push(txt)
				// }
				InputStream.close();
				fileOutputStream.flush();
				fileOutputStream.close();
			
				console.log('ccccc', arr);
			} catch (e) {
				//TODO handle the exception
				console.log('eeee', e);
			} 
			 */

			if ('file' == uri.getScheme().toLowerCase()) {
				//使用第三方应用打开
				path = uri.getPath();
				return;
			}
			if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
				//4.4以后
				path = getPath(this, uri);
			} else {
				//4.4以下下系统调用方法
				path = getRealPathFromURI(uri);
			}
			console.log('文件路径', path);
		}
		// 4.4 以上 从Uri 获取文件绝对路径
		function getPath(context, uri) {
			let isKitKat = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;
			let scheme = uri.getScheme().toLowerCase();
			if (isKitKat && DocumentsContract.isDocumentUri(context, uri)) {
				// ExternalStorageProvider
				if (isExternalStorageDocument(uri)) {
					let docId = DocumentsContract.getDocumentId(uri);
					let split = docId.split(':');
					let type = split[0];
					// 如果是手机内部存储
					if ('primary' == type.toLowerCase()) {
						return Environment.getExternalStorageDirectory() + '/' + split[1];
					} else {
						return '/storage/' + type + '/' + split[1];
					}
				}
				// DownloadsProvider
				else if (isDownloadsDocument(uri)) {
					let id = DocumentsContract.getDocumentId(uri);
					let split = id.split(':');
					return split[1];
					// console.log(id)
					// let contentUri = ContentUris.withAppendedId(Uri.parse("content://downloads/public_downloads"), id);
					// return getDataColumn(context, contentUri, null, null);
				}
				// MediaProvider
				else if (isMediaDocument(uri)) {
					let docId = DocumentsContract.getDocumentId(uri);
					let split = docId.split(':');
					let type = split[0];
					let contentUri = null;
					if ('image' == type.toLowerCase()) {
						contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
					} else if ('video' == type.toLowerCase()) {
						contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
					} else if ('audio' == type.toLowerCase()) {
						contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
					}
					let selection = '_id=?';
					let selectionArgs = [split[1]];
					return getDataColumn(context, contentUri, selection, selectionArgs);
				}
			}
			// MediaStore (and general)
			else if ('content' == scheme) {
				return getDataColumn(context, uri, null, null);
			}
			// File
			else if ('file' == scheme) {
				return uri.getPath();
			}
		}
		// 4.4 以下 获取 绝对路径
		function getRealPathFromURI(uri) {
			let res = null;
			let proj = [MediaStore.Images.Media.DATA];
			let cursor = contentResolver.query(uri, proj, null, null, null);
			if (null != cursor && cursor.moveToFirst()) {
				let column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
				res = cursor.getString(column_index);
				cursor.close();
			}
			return res;
		}
		// 通过uri 查找出绝对路径
		function getDataColumn(context, uri, selection, selectionArgs) {
			let cursor = null;
			let column = '_data';
			let projection = [column];
			// let contentResolver = context.getContentResolver()
			// plus.android.importClass(contentResolver);
			cursor = contentResolver.query(uri, projection, selection, selectionArgs, null);
			if (cursor != null && cursor.moveToFirst()) {
				let column_index = cursor.getColumnIndexOrThrow(column);
				return cursor.getString(column_index);
			}
		}

		function isExternalStorageDocument(uri) {
			return 'com.android.externalstorage.documents' == uri.getAuthority() ? true : false;
		}

		function isDownloadsDocument(uri) {
			return 'com.android.providers.downloads.documents' == uri.getAuthority() ? true : false;
		}

		function isMediaDocument(uri) {
			return 'com.android.providers.media.documents' == uri.getAuthority() ? true : false;
		}
	};
}
