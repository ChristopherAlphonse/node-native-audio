{
  "targets": [
    {
      "target_name": "audio_capture_core",
      "sources": [
        "src/native/audio_capture_core.cpp",
        "src/native/platform/windows_wasapi.cpp",
        "src/native/platform/macos_core_audio.cpp",
        "src/native/platform/linux_alsa.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "src/native/include"
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
          "sources": [
            "src/native/platform/windows_wasapi.cpp"
          ],
          "libraries": [
            "-lole32.lib",
            "-loleaut32.lib",
            "-lmmdevapi.lib"
          ]
        }],
        ["OS=='mac'", {
          "sources": [
            "src/native/platform/macos_core_audio.cpp"
          ],
          "libraries": [
            "-framework CoreAudio",
            "-framework AudioToolbox",
            "-framework CoreFoundation"
          ]
        }],
        ["OS=='linux'", {
          "sources": [
            "src/native/platform/linux_alsa.cpp"
          ],
          "libraries": [
            "-lasound"
          ]
        }]
      ]
    }
  ]
}
