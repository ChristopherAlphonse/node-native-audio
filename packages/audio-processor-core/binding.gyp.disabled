{
  "targets": [
    {
      "target_name": "audio_processor_core",
      "sources": [
        "src/native/audio_processor_core.cpp",
        "src/native/webrtc_processor.cpp",
        "src/native/simd_processor.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "src/native/include",
        "src/native/webrtc/include"
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
