if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props) {
      const openRootFileDir = () => {
        uni.navigateTo({
          url: "/pages/root-filelist/root-filelist"
        });
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("button", {
            onClick: openRootFileDir,
            class: "item-1 item",
            type: "primary"
          }, "获取手机目录"),
          vue.createElementVNode("button", {
            class: "item-2 item",
            type: "primary"
          }, "获取 Android/data 目录")
        ]);
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "C:/Users/Administrator/Desktop/test/uniapp-Android-fileDirectory/pages/index/index.vue"]]);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const pdf = "/static/icon_pdf.png";
  const word = "/static/icon_word.png";
  function getData(data) {
    let date = new Date(data);
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  }
  function getSize(value) {
    if (value > 1e6)
      return (value / 1e6).toFixed(1) + "MB";
    else if (value > 1e3)
      return (value / 1e3).toFixed(1) + "KB";
    else if (value < 1e3)
      return value + "B";
  }
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "root-filelist",
    setup(__props) {
      const File = plus.android.importClass("java.io.File");
      const fileList = vue.ref([]);
      const stack = vue.ref([]);
      function fileType(type) {
        return /.docx$/.test(type) ? word : pdf;
      }
      const stackLaset = vue.computed(() => {
        return {
          type: "dir",
          path: stack.value[stack.value.length - 2]
        };
      });
      const openParent = (item) => {
        stack.value = stack.value.slice(0, stack.value.length - 1);
        fileList.value = [];
        getPrivateDir(item.path);
      };
      function onFileSelected(item) {
        if (item.type === "dir") {
          stack.value.push(item.path);
          fileList.value = [];
          getPrivateDir(item.path);
        } else {
          formatAppLog("log", "at pages/root-filelist/root-filelist.vue:54", "选中的文件", item);
        }
      }
      function getPrivateDir(dirPath) {
        uni.showLoading({
          title: "加载中"
        });
        let dir = new File(dirPath);
        if (!dir.exists())
          return formatAppLog("log", "at pages/root-filelist/root-filelist.vue:68", "目录不存在");
        var files = dir.listFiles();
        if (files == null)
          return uni.hideLoading();
        const lists = [];
        for (var i = 0; i < files.length; i++) {
          let json = {
            name: "",
            type: "",
            time: "",
            size: "",
            path: ""
          };
          var file = files[i];
          if (file.isDirectory()) {
            let dirName = file.getName();
            let dirPath2 = file.getAbsolutePath();
            if (/^\./.test(dirName))
              continue;
            json.type = "dir";
            json.path = dirPath2;
            json.name = dirName;
            lists.push(json);
          } else {
            let fileName = file.getName();
            let fileSize = file.length();
            let filePath = file.getAbsolutePath();
            if (/^\./.test(fileName))
              continue;
            json.type = "file";
            json.name = fileName;
            json.size = fileSize;
            json.path = filePath;
            json.time = file.lastModified();
            lists.push(json);
          }
        }
        fileList.value = lists;
        uni.hideLoading();
      }
      vue.onMounted(() => {
        var dirPath = "/storage/emulated/0/";
        stack.value.push(dirPath);
        getPrivateDir(dirPath);
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          [
            stack.value.length > 1 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "file-item",
              onClick: _cache[0] || (_cache[0] = ($event) => openParent(vue.unref(stackLaset)))
            }, [
              vue.createElementVNode("view", { class: "" }, [
                vue.createElementVNode("image", {
                  src: "/static/phone.png",
                  class: "icon",
                  mode: "widthFix"
                })
              ]),
              vue.createElementVNode("view", { class: "item-content" }, [
                vue.createElementVNode("text", null, "...上一层")
              ])
            ])) : vue.createCommentVNode("v-if", true),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(fileList.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  onClick: ($event) => onFileSelected(item),
                  class: "file-item"
                }, [
                  vue.createElementVNode("view", { class: "" }, [
                    item.type === "file" ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      src: fileType(item.name),
                      class: "icon",
                      mode: "widthFix"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("image", {
                      key: 1,
                      src: "/static/phone.png",
                      class: "icon",
                      mode: "widthFix"
                    }))
                  ]),
                  vue.createElementVNode("view", { class: "item-content" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    ),
                    item.type === "file" ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "item-content-text"
                      },
                      vue.toDisplayString(vue.unref(getSize)(item.size)),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true),
                    item.type === "file" ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      { key: 1 },
                      vue.toDisplayString(vue.unref(getData)(item.time)),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ], 8, ["onClick"]);
              }),
              256
              /* UNKEYED_FRAGMENT */
            ))
          ],
          64
          /* STABLE_FRAGMENT */
        );
      };
    }
  });
  const PagesRootFilelistRootFilelist = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-234ed6ca"], ["__file", "C:/Users/Administrator/Desktop/test/uniapp-Android-fileDirectory/pages/root-filelist/root-filelist.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/root-filelist/root-filelist", PagesRootFilelistRootFilelist);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Administrator/Desktop/test/uniapp-Android-fileDirectory/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
