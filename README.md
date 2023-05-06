### 安卓手机目录
![图片](/static/home.png)
#### 1、获取安卓手机根目录
 有三种方法
 1. 通过plus.io.resolveLocalFileSystemURL
 2. 通过java.io.File 类
 3. 打开系统文件管理器
 注：
  如果安卓targetSdkVersion>=29 时通过plus.io.resolveLocalFileSystemURL 获取根目录会报错 https://ask.dcloud.net.cn/article/36199
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


推荐
https://ext.dcloud.net.cn/plugin?id=7983#detail
