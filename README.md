### 安卓手机目录
![图片](/static/preview.png)
我也是第一次使用uniapp开发移动端App，开始研究文件列表和微信文件列表也是很闷逼，那时候也根本不懂5+规范和原生安卓类，自己也查了很多资料、使用GPT3.5熟悉安卓的api。说实话GPT3.5只能是辅助，让他帮你写代码实在是为难了。
#### 1、获取安卓手机根目录
 有三种方法
 1. 通过plus.io.resolveLocalFileSystemURL
 2. 通过java.io.File 类
 3. 打开系统文件管理器
 注：
  如果安卓targetSdkVersion>=29 时通过 plus.io.resolveLocalFileSystemURL 获取根目录会报错 https://ask.dcloud.net.cn/article/36199
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

### 2.获取 Android/data 目录
1.如果 targetSdkVersion>=29（安卓10+）会有权限问题，所以如果是低版本安卓可以直接用上面方法直接获取，如果高版本需要先获取Android/data目录权限，然后再进行安卓原生类来获取授权文件目录

注：必须获取Android/data 目录的权限，如果不是该目录到时候访问会出错

推荐
https://ext.dcloud.net.cn/plugin?id=7983#detail
