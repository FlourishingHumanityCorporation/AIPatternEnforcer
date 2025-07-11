# Debug Snapshot

Generated: Thu Jul 10 19:44:07 PDT 2025
System: Darwin pauls-pc.lan 24.5.0 Darwin Kernel Version 24.5.0: Tue Apr 22 19:52:00 PDT 2025; root:xnu-11417.121.6~2/RELEASE_ARM64_T6031 arm64

## Table of Contents

1. [Process State](#process-state)
2. [Memory Usage](#memory-usage)
3. [Environment](#environment)
4. [Network State](#network-state)
5. [File Descriptors](#file-descriptors)
6. [Recent Logs](#recent-logs)
7. [Application State](#application-state)

---

## Process State

### Node.js Processes

```
paulrohde         7859   0.3  0.2 1623627232  83920   ??  S     1:07PM   1:56.65 /Applications/Windsurf.app/Contents/Frameworks/Windsurf Helper (Plugin).app/Contents/MacOS/Windsurf Helper (Plugin) --type=utility --utility-sub-type=node.mojom.NodeService --lang=en-US --service-sandbox-type=none --dns-result-order=ipv4first --inspect-port=0 --user-data-dir=/Users/paulrohde/Library/Application Support/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --shared-files --field-trial-handle=1718379636,r,11439366805144004031,2457563349749600649,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports,ScreenCaptureKitPickerScreen,ScreenCaptureKitStreamPickerSonoma --disable-features=CalculateNativeWinOcclusion,MacWebContentsOcclusion,SpareRendererForSitePerProcess,TimeoutHangingVideoCaptureStarts --variations-seed-version
paulrohde        73441   0.1  0.1 1623615616  21312   ??  S    Tue07PM   9:28.81 /Applications/Windsurf.app/Contents/Frameworks/Windsurf Helper.app/Contents/MacOS/Windsurf Helper --type=utility --utility-sub-type=node.mojom.NodeService --lang=en-US --service-sandbox-type=none --user-data-dir=/Users/paulrohde/Library/Application Support/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --shared-files --field-trial-handle=1718379636,r,11439366805144004031,2457563349749600649,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports,ScreenCaptureKitPickerScreen,ScreenCaptureKitStreamPickerSonoma --disable-features=CalculateNativeWinOcclusion,MacWebContentsOcclusion,SpareRendererForSitePerProcess,TimeoutHangingVideoCaptureStarts --variations-seed-version
paulrohde        90016   0.1  0.1 486794880  31184   ??  SN   Wed08AM   1:20.68 /usr/local/bin/node --require /Users/paulrohde/CodeProjects/AiTaskTracker/node_modules/tsx/dist/preflight.cjs --loader file:///Users/paulrohde/CodeProjects/AiTaskTracker/node_modules/tsx/dist/loader.mjs server/index.ts
paulrohde        97566   0.1  0.1 1865188304  34848   ??  S    Wed02PM   2:51.22 /Applications/Notion.app/Contents/Frameworks/Notion Helper.app/Contents/MacOS/Notion Helper --type=utility --utility-sub-type=node.mojom.NodeService --lang=en-US --service-sandbox-type=none --user-data-dir=/Users/paulrohde/Library/Application Support/Notion --shared-files --field-trial-handle=1718379636,r,13325526784568524149,14967456885570174821,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports,MacLoopbackAudioForScreenShare,PdfUseShowSaveFilePicker,ScreenCaptureKitPickerScreen,ScreenCaptureKitStreamPickerSonoma --disable-features=MacWebContentsOcclusion,SpareRendererForSitePerProcess,TimeoutHangingVideoCaptureStarts --variations-seed-version
paulrohde         9349   0.0  0.1 1621870112  31376   ??  S     1:09PM   0:03.26 /Applications/Windsurf.app/Contents/Frameworks/Windsurf Helper (Plugin).app/Contents/MacOS/Windsurf Helper (Plugin) /Applications/Windsurf.app/Contents/Resources/app/extensions/markdown-language-features/dist/serverWorkerMain --node-ipc --clientProcessId=7859
paulrohde         9347   0.0  0.1 1621868768  38944   ??  S     1:09PM   0:02.04 /Applications/Windsurf.app/Contents/Frameworks/Windsurf Helper (Plugin).app/Contents/MacOS/Windsurf Helper (Plugin) /Users/paulrohde/.windsurf/extensions/dbaeumer.vscode-eslint-3.0.10-universal/server/out/eslintServer.js --node-ipc --clientProcessId=7859
paulrohde         7889   0.0  0.1 1621873888  26704   ??  S     1:07PM   0:02.02 /Applications/Windsurf.app/Contents/Frameworks/Windsurf Helper (Plugin).app/Contents/MacOS/Windsurf Helper (Plugin) /Applications/Windsurf.app/Contents/Resources/app/extensions/json-language-features/server/dist/node/jsonServerMain --node-ipc --clientProcessId=7859
paulrohde         7857   0.0  0.1 1623615072  29824   ??  S     1:07PM   0:05.13 /Applications/Windsurf.app/Contents/Frameworks/Windsurf Helper.app/Contents/MacOS/Windsurf Helper --type=utility --utility-sub-type=node.mojom.NodeService --lang=en-US --service-sandbox-type=none --user-data-dir=/Users/paulrohde/Library/Application Support/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --shared-files --field-trial-handle=1718379636,r,11439366805144004031,2457563349749600649,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports,ScreenCaptureKitPickerScreen,ScreenCaptureKitStreamPickerSonoma --disable-features=CalculateNativeWinOcclusion,MacWebContentsOcclusion,SpareRendererForSitePerProcess,TimeoutHangingVideoCaptureStarts --variations-seed-version
paulrohde         4416   0.0  0.0 411325712   9088   ??  SN   Wed08AM   0:34.65 /Users/paulrohde/CodeProjects/AiTaskTracker/node_modules/vite/node_modules/@esbuild/darwin-arm64/bin/esbuild --service=0.21.5 --ping
paulrohde        90401   0.0  0.0 411343424   9248   ??  SN   Wed08AM   0:35.27 /Users/paulrohde/CodeProjects/AiTaskTracker/node_modules/vite/node_modules/@esbuild/darwin-arm64/bin/esbuild --service=0.21.5 --ping
paulrohde        90397   0.0  0.0 433476320  14896   ??  SN   Wed08AM   0:38.21 node /Users/paulrohde/CodeProjects/AiTaskTracker/node_modules/.bin/vite --config vite.config.ts --port 5173
paulrohde        90372   0.0  0.0 411670880   4320   ??  SN   Wed08AM   0:00.13 npm run dev:client
paulrohde        90013   0.0  0.0 423205888   3104   ??  SN   Wed08AM   0:00.12 node /Users/paulrohde/CodeProjects/AiTaskTracker/node_modules/.bin/tsx server/index.ts
paulrohde        89986   0.0  0.0 411696992   4320   ??  SN   Wed08AM   0:00.14 npm run dev
```

## Memory Usage

### Node.js Memory

```javascript
{
  "rss": 30425088,
  "heapTotal": 3899392,
  "heapUsed": 2690312,
  "external": 1076684,
  "arrayBuffers": 10511
}
```

### System Memory

```
Mach Virtual Memory Statistics: (page size of 16384 bytes)
Pages free:                                4498.
Pages active:                            473096.
Pages inactive:                          465956.
Pages speculative:                         6102.
Pages throttled:                              0.
Pages wired down:                        325321.
Pages purgeable:                              2.
"Translation faults":               19485690956.
Pages copy-on-write:                 1297599538.
```

## Environment

### Application Variables

```

```

## Network State

### Listening Ports

```

```
