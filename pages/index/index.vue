<template>
  <view class="content">
    <button @click="openRootFileDir" class="item-1 item" type="primary">
      获取手机目录
    </button>
    <button @click="openHTMLRootFileDir" class="item-1 item" type="primary">
      5+获取手机目录
    </button>
    <button @click="openSystemFileManager" class="item-1 item" type="primary">
      打开系统文件管理器
    </button>
    <button @click="openWeixinFileDir" class="item-2 item" type="primary">
      获取微信Download目录
    </button>
  </view>
</template>

<script lang="ts" setup>
import { systemFileManager, selectCatalog } from "../../utils/comm";
import { ref } from "vue";

const isPrv = ref(false);

// #ifdef APP-PLUS
const main = plus.android.runtimeMainActivity();
// #endif

const openRootFileDir = () => {
  uni.navigateTo({
    url: "/pages/root-filelist/root-filelist",
  });
};

const openSystemFileManager = () => {
// selectCatalog 方法是获取文件目录权限，等再调用systemFileManager方法可直接进入授权后的目录
// 如果不想进入 Android/data 授权的目录可以不用调用
  // #ifdef APP-PLUS
  isPrv.value ? systemFileManager() : selectCatalog(isPrv);
  // #endif
};

const openHTMLRootFileDir = () => {
  uni.navigateTo({
    url: "/pages/root-filelist/root-fileList-Html5",
  });
};

const openWeixinFileDir = () => {
  let permission = uni.getStorageSync("permission");
  let systemInfo = JSON.parse(uni.getStorageSync("systemInfo") || {});
  if (permission || systemInfo.osAndroidAPILevel <= 29) {
    uni.navigateTo({
      url: "/pages/weixin-filelist/weixin-filelist",
    });
  } else {
    weixinPDF();
  }
};

function pathToUri(path, Uri) {
  return Uri.parse(
    "content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata/document/primary%3A" +
      path.replace("/storage/emulated/0/", "").replace("/", "%2F")
  );
}

function weixinPDF() {
  /* 参考资料
			https://sky233.ml/android11-data/
			https://juejin.cn/post/7029511724424232997#comment
		*/
  // 请求存储权限指令，用于权限返回判断
  var REQUESTCODE = 11;

  // 引入相关类
  const Intent = plus.android.importClass("android.content.Intent");
  const Uri = plus.android.importClass("android.net.Uri");
  const DocumentsContract = plus.android.importClass(
    "android.provider.DocumentsContract"
  );
  const DocumentFile = plus.android.importClass(
    "androidx.documentfile.provider.DocumentFile"
  );

  // 创建 Uri 对象
  const uri = Uri.parse(
    "content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata"
  );

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
    Intent.FLAG_GRANT_READ_URI_PERMISSION |
      Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
      Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION |
      Intent.FLAG_GRANT_PREFIX_URI_PERMISSION
  );

  // 设置初始 Uri
  if (documentFile != null) {
    // 将指定的 URI 作为初始 URI 添加到 Intent 中
    // documentFile 是一个 DocumentFile 对象，用于表示要访问的文件或目录
    // getUri() 方法用于获取该文件或目录的 URI
    intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, documentFile.getUri());
  }

  // 权限确认后调用该方法
  main.onActivityResult = function (requestCode, resultCode, data) {
    // 获取授权的路径，并判断是否是 Android/data
    let path = data.getData().getPath();
    if (requestCode === REQUESTCODE && path.split(":")[1] === "Android/data") {
      //本地存一下，用于判断是否已有访问权限
      uni.setStorage({
        key: "permission",
        data: true,
      });
      let contentResolver = main.getContentResolver();
      plus.android.importClass(contentResolver);
      // 保存权限
      try {
        contentResolver.takePersistableUriPermission(
          data.getData(),
          data.getFlags() &
            (Intent.FLAG_GRANT_READ_URI_PERMISSION |
              Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        );
      } catch (e) {
        //TODO handle the exception
        console.warn("c错误", e);
      }
    }
  };

  // 用于启动一个 Activity (是一个表示用户界面的组件，用于与用户进行交互) 并等待其返回结果
  // intent 用于标识该请求的唯一性
  main.startActivityForResult(intent, REQUESTCODE);
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.item {
  margin-top: 20px;
}
</style>
