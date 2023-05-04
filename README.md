### 安卓手机目录
#### 1、获取安卓手机根目录
	安卓手机根目录通过 5+ api 的 plus.io.resolveLocalFileSystemURL 获取
	会报错 https://ask.dcloud.net.cn/article/36199
	所以只能通过安卓原生模块 File 来获取当前手机目录列表
	```
	// 具体看 root-fileList.vue 文件
	
	// 导入 java.io.File 类
	const File = plus.android.importClass('java.io.File');
	
	// 创建 File 对象，指定目录路径
	let dir = new File(dirPath);
	
	// 判断目录是否存在
	if (!dir.exists()) return console.log('目录不存在');
	
	// 获取目录下的文件列表
	let files = dir.listFiles();
	
	```