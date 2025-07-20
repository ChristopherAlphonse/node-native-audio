{
  "targets": [
    {
      "target_name": "whisper_native_core",
      "sources": [
        "src/native/whisper_native_core.cpp",
        "src/native/whisper_wrapper.cpp",
        "src/native/model_manager.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "src/native/include",
        "src/native/whisper/include"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.15"
      },
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "AdditionalOptions": ["/EHsc"]
        }
      },
      "conditions": [
        ["OS=='win'", {
          "libraries": [
            "-lole32.lib",
            "-loleaut32.lib"
          ]
        }],
        ["OS=='mac'", {
          "libraries": [
            "-framework CoreAudio",
            "-framework AudioToolbox"
          ]
        }],
        ["OS=='linux'", {
          "libraries": [
            "-lasound"
          ]
        }]
      ]
    }
  ]
}
