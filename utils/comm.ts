export function systemFileManager() {
	// 参考: http://www.cnblogs.com/panhouye/archive/2017/04/23/6751710.html
	let main = plus.android.runtimeMainActivity();
	let Intent = plus.android.importClass('android.content.Intent');

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
		var File = plus.android.importClass('java.io.File');

		// 给系统导入 contentResolver
		let contentResolver = main.getContentResolver();
		plus.android.importClass(contentResolver);
		// 返回路径
		let path = '';
		console.log('resultCode', resultCode);
		if (resultCode == Activity.RESULT_OK) {
			let uri = data.getData();
			let src = uri.getPath();
			let source = new File(src);
			// 获取文件相关信息
			console.log(data, uri, src, source.toString());

			if ('file' == uri.getScheme().toLowerCase()) {
				console.log(1);
				//使用第三方应用打开
				path = uri.getPath();
				return;
			}
			if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
				console.log(2);
				//4.4以后
				path = getPath(this, uri);
			} else {
				console.log(3);
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
					console.log(444, type.toLowerCase());
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

// 选择目录列表
export function selectCatalog(isPrv) {
	/* 参考资料
		https://sky233.ml/android11-data/
		https://juejin.cn/post/7029511724424232997#comment
	*/
	// 请求存储权限指令，用于权限返回判断
	var REQUESTCODE = 11;

	// 引入相关类
	const Intent = plus.android.importClass('android.content.Intent');
	const Uri = plus.android.importClass('android.net.Uri');
	const DocumentsContract = plus.android.importClass('android.provider.DocumentsContract');
	const DocumentFile = plus.android.importClass('androidx.documentfile.provider.DocumentFile');
	let main = plus.android.runtimeMainActivity();
	// 创建 Uri 对象
	const uri = Uri.parse('content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata');

	// 创建 DocumentFile 对象
	// const documentFile = plus.android.invoke('android.documentfile.provider.DocumentFile', 'fromTreeUri', main, uri);
	// const documentFile = DocumentFile.fromTreeUri(main, uri)
	const documentFile = DocumentFile.fromTreeUri(main, uri);

	// 创建 Intent 对象
	const intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
	/*
	intent.setFlags() 方法是用于设置 Intent 对象的标志位的方法
	Intent 是 Android 中的一个类，用于表示应用之间的通信和交互。
	 在使用 Intent 进行跨应用通信时，需要设置相应的标志位来授予对应的权限。
				 
	 Intent.FLAG_GRANT_READ_URI_PERMISSION 和 Intent.FLAG_GRANT_WRITE_URI_PERMISSION 标志用于授予读写 URI 的权限，
	 Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION 标志用于授予持久化的 URI 权限，Intent.FLAG_GRANT_PREFIX_URI_PERMISSION 标志用于授予 URI 前缀匹配的权限
	*/
	intent.setFlags(
		Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION
	);

	// 设置初始 Uri
	if (documentFile != null) {
		// 将指定的 URI 作为初始 URI 添加到 Intent 中
		// documentFile 是一个 DocumentFile 对象，用于表示要访问的文件或目录
		// getUri() 方法用于获取该文件或目录的 URI
		intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, documentFile.getUri());
	}

	// 权限确认后调用该方法
	main.onActivityResult = function(requestCode, resultCode, data) {
		console.log('ccccc', requestCode, resultCode, data, data.getData());
		if (requestCode === REQUESTCODE) {
			//本地存一下，用于判断是否已有访问权限
			isPrv.value = true;

			// 保存权限
			try {
				// 给系统导入 contentResolver
				let contentResolver = main.getContentResolver();
				plus.android.importClass(contentResolver);

				contentResolver.takePersistableUriPermission(data.getData(), data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION));
			} catch (e) {
				//TODO handle the exception
				console.warn('c错误', e);
			}
		}
	};

	// 用于启动一个 Activity (是一个表示用户界面的组件，用于与用户进行交互) 并等待其返回结果
	// intent 用于标识该请求的唯一性
	main.startActivityForResult(intent, REQUESTCODE);
}
