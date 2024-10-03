"use strict";

let nestUtilPtr = null;

// 加载 WebAssembly 模块
window.loadWebAssembly = function () {
  return NestUtil().then(Module => {
    window.createNestUtil = function () {
      nestUtilPtr = Module._create_nest_util();
    };

    window.destroyNestUtil = function () {
      if (nestUtilPtr !== null) {
        Module._destroy_nest_util(nestUtilPtr);
        Module._free(nestUtilPtr);
        nestUtilPtr = null;
      }
    };

    window.importParts = function (parts) {
      if (nestUtilPtr === null) {
        console.error("NestUtil instance is not created.");
        return;
      }

      // 将 parts 对象转换为 JSON 字符串
      const jsonString = parts;

      // 分配内存并将 JSON 字符串复制到 WebAssembly 内存中
      const jsonStringPtr = Module._malloc(Module.lengthBytesUTF8(jsonString) + 1);
      Module.stringToUTF8(jsonString, jsonStringPtr, Module.lengthBytesUTF8(jsonString) + 1);

      // 调用 WebAssembly 函数
      Module._import_parts(nestUtilPtr, jsonStringPtr);

      // 释放分配的内存
      Module._free(jsonStringPtr);
    };

    window.startNesting = function (space) {
      if (nestUtilPtr === null) {
        console.error("NestUtil instance is not created.");
        return;
      }
      Module._start_nesting(nestUtilPtr, space);
    };

    window.stopNesting = function () {
      if (nestUtilPtr === null) {
        console.error("NestUtil instance is not created.");
        return;
      }
      Module._stop_nesting(nestUtilPtr);
    };

    window.setOnResultCallback = function (callback) {
      if (nestUtilPtr === null) {
        console.error("NestUtil instance is not created.");
        return;
      }

      // 将 JavaScript 回调函数转换为指针
      const wrappedCallback = Module.addFunction(function (jsonPtr) {
        const jsonString = Module.UTF8ToString(jsonPtr);
        callback(jsonString);
      }, 'vi');
      // 调用 WebAssembly 函数并传递指针
      Module._set_on_result_callback(nestUtilPtr, wrappedCallback);
    };

    window.offsetPolygons = function (offset) {
      if (nestUtilPtr === null) {
        console.error("NestUtil instance is not created.");
        return;
      }
      Module._offset_polygons(nestUtilPtr, offset);
    };
    if (window.onWasmLoaded) {
      window.onWasmLoaded();
    }
  }).catch(error => {
    console.error('Error loading NestUtil module:', error);
  });
};