<template>
  <view
    v-for="item of fileList"
    class="file-item"
    @click="onFileSelected(item)"
  >
    <view class=""
      ><image :src="fileType(item.name)" class="icon" mode="widthFix"></image
    ></view>
    <view class="item-content">
      <text>{{ item.name }}</text>
      <text class="item-content-text">{{ getSize(item.size) }}</text>
      <text>{{ getData(item.time) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import pdf from "../../static/icon_pdf.png";
import word from "../../static/icon_word.png";

let main = plus.android.runtimeMainActivity();

const fileList = ref<any[]>([]);

function fileType(type: string) {
  return /.docx$/.test(type) ? word : pdf;
}

function onFileSelected(item) {
  if (item.size > 25 * 10 ** 6) return;
  // 将文件复制到公共目录
  // copyFileByUri(item);
  copyFile(item);
}

function getData(data) {
  let date = new Date(data);
  let year = date.getFullYear();
  let month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  let minutes =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  let seconds =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

  return (
    year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds
  );
}

function getSize(value: number) {
  if (value > 1000000) return (value / 1000000).toFixed(1) + "MB";
  else if (value > 1000) return Math.floor(value / 1000).toFixed(1) + "KB";
  else if (value < 1000) return value + "B";
}

function pathToUri(path, Uri) {
  return Uri.parse(
    "content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata/document/primary%3A" +
      path.replace("/storage/emulated/0/", "").replace("/", "%2F")
  );
}

// 将 Android/data 目录下的文件拷贝到公共目录下
function copyFileByUri(item) {
  plus.android.importClass("java.io.FileInputStream");
  let FileOutputStream = plus.android.importClass("java.io.FileOutputStream");

  // 导入 Android 原生类 ContentResolver
  let contentResolver = main.getContentResolver();
  plus.android.importClass(contentResolver);

  let inputStream = null;
  let fileOutputStream = null;
  try {
    inputStream = contentResolver.openInputStream(item.pathUri.getUri());

    fileOutputStream = new FileOutputStream(
      "/storage/emulated/0/Download/" + item.name
    );

    let byteRead = 0;
    while ((byteRead = inputStream.read()) != -1 && byteRead != null) {
      fileOutputStream.write(byteRead);
    }
    inputStream.close();
    fileOutputStream.flush();
    fileOutputStream.close();
    console.log("结束了");
  } catch (e) {
    //TODO handle the exception
    console.log("错误", e);
  }
}

function copyFile(item) {
  uni.showLoading({
    title: "请稍等...",
  });
  // 引入相关类
  plus.android.importClass("java.io.FileInputStream");
  plus.android.importClass("java.nio.ByteBuffer");
  plus.android.importClass("java.nio.channels.FileChannel");
  const FileOutputStream = plus.android.importClass("java.io.FileOutputStream");
  const contentResolver = main.getContentResolver();
  plus.android.importClass(contentResolver);

  // 开启文件流
  const fis = contentResolver.openInputStream(item.pathUri.getUri());
  const fos = new FileOutputStream("/storage/emulated/0/Download/" + item.name);
  // 获得FileChannel管道对象
  const c1 = fis.getChannel();
  const c2 = fos.getChannel();

  // 创建ByteBuffer数组
  const b = plus.android.invoke("java.nio.ByteBuffer", "allocate", 1024 * 1024);

  // 循环读取数据
  while (c1.read(b) != -1) {
    // 读取的字节会填充postion到limit位置之间
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

// 获取微信 Download 目录下文件列表
function weixinPathList() {
  const weixinPath =
    "/storage/emulated/0/Android/data/com.tencent.mm/MicroMsg/Download";
  const Uri = plus.android.importClass("android.net.Uri");
  const DocumentFile = plus.android.importClass(
    "androidx.documentfile.provider.DocumentFile"
  );

  const documentFile = DocumentFile.fromTreeUri(
    main,
    pathToUri(weixinPath, Uri)
  );

  console.log(
    "documentFile--",
    documentFile.isDirectory(),
    documentFile.listFiles(),
    documentFile.getName()
  );
  if (documentFile.isDirectory()) {
    // 不能通过DocumentFile.fromTreeUri直接到Download目录，所以手动循环到该目录，
    // listFiles 方法是获取 documentFile 目录下所有文件和文件夹
    let documentFiles = documentFile.listFiles();
    let documentFile2 = null;
    for (let file of documentFiles) {
      if (file.getName() == "com.tencent.mm") {
        documentFile2 = file;
        break;
      }
    }
    let documentFile3 = null;
    for (let listFile of documentFile2.listFiles()) {
      if (listFile.getName() == "MicroMsg") {
        documentFile3 = listFile;
        break;
      }
    }

    let documentFile4 = null;
    for (let listFile of documentFile3.listFiles()) {
      if (listFile.getName() == "Download") {
        documentFile4 = listFile;
        break;
      }
    }

    for (let item of documentFile4.listFiles()) {
      if (item.isDirectory()) continue;

      let json = {
        name: "",
        type: "",
        time: "",
        size: "",
        path: "",
        pathUri: null,
      };
      json.type = "file";
      json.name = item.getName();
      json.size = item.length();
      json.path = weixinPath + "/" + item.getName();
      json.time = item.lastModified();
      json.pathUri = item;
      fileList.value.push(json);
    }
  }
}

// 安卓10 以下版本
function getPrivateDir(dirPath: string) {
  console.log("dirPath: ", dirPath);
  // 导入 java.io.File 类
  var File = plus.android.importClass("java.io.File");

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
          name: "",
          type: "",
          time: "",
          size: "",
          path: "",
        };
        var file = files[i];
        // 判断是文件还是文件目录
        if (file.isDirectory()) {
          // 处理文件目录
          let dirName = file.getName();
          let dirPath = file.getAbsolutePath();
          console.log("文件目录名: " + dirName);
          // console.log('文件目录路径: ' + dirPath);
          if (/^\./.test(dirName)) continue;
          json.type = "dir";
          json.path = dirPath;
          json.name = dirName;
          fileList.value.push(json);
        } else {
          // 处理文件
          let fileName = file.getName();
          let fileSize = file.length();
          let filePath = file.getAbsolutePath();

          if (/^\./.test(fileName)) continue;

          json.type = "file";
          json.name = fileName;
          json.size = fileSize;
          json.path = filePath;
          json.time = file.lastModified();
          fileList.value.push(json);
        }
      }
    }
  } else {
    console.log("目录不存在");
  }
}

onMounted(() => {
  let systemInfo = JSON.parse(uni.getStorageSync("systemInfo") || {});
  if (systemInfo.osAndroidAPILevel <= 29) {
    getPrivateDir(
      "/storage/emulated/0/Android/data/com.tencent.mm/MicroMsg/Download"
    );
  } else {
    weixinPathList();
  }
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
