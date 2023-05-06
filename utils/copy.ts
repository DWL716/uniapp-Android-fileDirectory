function copyTet(pathUri) {
  console.log("pathUri", pathUri);
  let pathUrl = "/log.txt"; //指定文件路径
  let environment = plus.android.importClass("android.os.Environment");
  var sdRoot = environment.getExternalStorageDirectory(); //文件夹根目录
  var File = plus.android.importClass("java.io.File");
  var BufferedReader = plus.android.importClass("java.io.BufferedReader");
  var FileReader = plus.android.importClass("java.io.FileReader");
  var FileWriter = plus.android.importClass("java.io.FileWriter");
  var FileInputStream = plus.android.importClass("java.io.FileInputStream");
  var FileOutputStream = plus.android.importClass("java.io.FileOutputStream");

  let contentResolver = main.getContentResolver();
  plus.android.importClass(contentResolver);

  // /storage/emulated/0/Android/data/com.tencent.mm/MicroMsg/Download/iim.txt
  // '/Android/data/com.tencent.mm/MicroMsg/Download/iim.txt'
  console.log("sdRoot", sdRoot);
  let readFr = new File(sdRoot + pathUrl);
  let txt = "";
  try {
    var reader = new BufferedReader(new FileReader(readFr));
    console.log("reader", reader);
    // 我的需求是读取多行,所以把每行都读出来存在数组里
    let arr = [];
    let txt;
    while ((txt = reader.readLine()) != null) {
      console.log("txt", txt);
      arr.push(txt);
    }
    // 传入回调处理你的业务
    console.log("arr", arr);
    //处理业务逻辑
  } catch (e) {
    console.log("eeee", e);
  }
}

function copyFile(item) {
  uni.showLoading({
    title: "请稍等...",
  });
  plus.android.importClass("java.io.FileInputStream");

  var FileOutputStream = plus.android.importClass("java.io.FileOutputStream");
  plus.android.importClass("java.nio.channels.FileChannel");
  let contentResolver = main.getContentResolver();
  plus.android.importClass(contentResolver);
  let fis = contentResolver.openInputStream(item.pathUri.getUri());
  let fos = new FileOutputStream("/storage/emulated/0/Download/" + item.name);
  // 获得FileChannel管道对象
  let c1 = fis.getChannel();
  let c2 = fos.getChannel();

  // 创建ByteBuffer数组
  plus.android.importClass("java.nio.ByteBuffer");
  let b = plus.android.invoke("java.nio.ByteBuffer", "allocate", 1024 * 1024);

  // 循环读取数据
  while (c1.read(b) != -1) {
    // 读取的字节会填充postion到limit位置之间
    console.log("---");
    // 重置 postion为0,limit为postion的位置
    b.flip();
    // 写出数据
    c2.write(b); // 会把postion到limit之间的数据写出
    // 还原
    b.clear(); // positon为:0  limit为: capacity 用于下次读取
  }

  // 释放资源
  c2.close();
  c1.close();
  fos.close();
  fis.close();
  uni.hideLoading();
}

function copyFileByUri(item) {
  uni.showLoading({
    title: "请稍等...",
  });
  // const Uri = plus.android.importClass('android.net.Uri');
  // var String = plus.android.importClass('java.lang.String');
  // var byteClass = plus.android.importClass('java.type');
  // let Environment = plus.android.importClass('android.os.Environment');
  // const DocumentFile = plus.android.importClass('androidx.documentfile:documentfile:1.0.1');
  plus.android.importClass("java.io.FileInputStream");
  // var File = plus.android.importClass('java.io.File');

  var FileOutputStream = plus.android.importClass("java.io.FileOutputStream");

  let contentResolver = main.getContentResolver();
  plus.android.importClass(contentResolver);

  let inputStream = null;
  let fileOutputStream = null;
  try {
    inputStream = contentResolver.openInputStream(item.pathUri.getUri());
    // ==
    // 复制文本的
    // let fileWriter = plus.android.importClass('java.io.FileWriter');
    // let writer = new fileWriter('/storage/emulated/0/Download/' + item.name);
    // let bufferedWriter = plus.android.importClass('java.io.BufferedWriter');
    // let bw = new bufferedWriter(writer);
    // let inputStreamReader = plus.android.importClass('java.io.InputStreamReader');
    // let isr = new inputStreamReader(inputStream);
    // let bufferedReader = plus.android.importClass('java.io.BufferedReader');
    // let br = new bufferedReader(isr);
    // let line = null;
    // while ((line = br.readLine()) != null) {
    // 	console.log('line', line);
    // 	bw.write(line);
    // 	bw.newLine();
    // }
    // br.close();
    // isr.close();
    // bw.close();
    // writer.close();
    // console.log('文件已保存到：' + '/storage/emulated/0/Download/' + item.name);
    // ====

    // 二进制流操作
    // let inputStream = contentResolver.openInputStream(item.pathUri.getUri());
    let fileOutputStream = plus.android.importClass("java.io.FileOutputStream");
    let fos = new fileOutputStream("/storage/emulated/0/Download/" + item.name);
    plus.android.importClass("java.nio.ByteBuffer");
    let buffer = plus.android.invoke("java.nio.ByteBuffer", "allocate", 10240);
    let bytesRead = 0;
    while (
      (bytesRead = inputStream.read(buffer.array(), 0, buffer.remaining())) !=
        -1 &&
      bytesRead != null
    ) {
      // buffer.limit(bytesRead);
      buffer.flip();
      console.log("buffer.array()", bytesRead);
      fos.write(buffer.array(), 0, bytesRead);
      buffer.clear();
    }

    inputStream.close();
    fos.close();
    console.log("文件已保存到：" + "/storage/emulated/0/Download/" + item.name);
    // ==
    // console.log('size====', inputStream.available());
    // fileOutputStream = new FileOutputStream('/storage/emulated/0/Download/' + item.name);
    // let byteRead = 0;
    // while ((byteRead = inputStream.read()) != -1) {
    // 	fileOutputStream.write(byteRead);
    // }
    // inputStream.close();
    // fileOutputStream.flush();
    // fileOutputStream.close();
    // console.log('结束了');
  } catch (e) {
    //TODO handle the exception
    console.log("错误", e);
    // e.printStackTrace();
  }

  uni.hideLoading();
}
