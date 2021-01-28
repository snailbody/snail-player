import Utils from './utils/index.js'

let utils = new Utils()

class snailPlayer {
  constructor(opt = {}) {
    this.el = null
    this.playVideo = null
    this.playFunc = null
    this.timer = null
    this.src = opt.src
    this.videoSrc = null
    this.fullScreen = null
    this.playBottom = null
    this.totalTime = null
    this.currentTime = null
    this.playerBtn = null
    this.progress = null // 进度条
    this.progressw = null // 进度条宽度
    this.progressFinish = null // 播完的进度
    this.videoWrapper = null // 播放器区域
    this.startAndPause = null // 开始暂停键
    this.startAndPauseStart = null // 开始按钮
    this.startAndPausePause = null // 暂停按钮
    this.rollTime = null // 滚动时间
    this.playDot = null // 拖拽点
    this.playing = false
    this.dbClickTimer = null // 但双击定时器
    this.voiceDot = null // 声音按钮
    this.voiceProgress = null // 声音进度条
    this.voiceProgressFinish = null // 声音进度条完成
    this.voiceNum = null // 声音值
    this.voiceBtn = null // 声音按钮
    this.getEle()
  }

  getEle() {
    this.el = document.getElementsByClassName('snail-wrapper')[0]
    this.playVideo = document.getElementById('snailPlayVideo')
    this.videoSrc = this.playVideo.getElementsByTagName('source')[0]
    this.playFunc = document.getElementsByClassName('sn-player-progress-wrapper')[0]
    this.fullScreen = document.getElementsByClassName('snail-player-fullscreen')[0]
    this.playBottom = document.getElementsByClassName('sn-player-bottom-wrapper')[0]
    this.playerBtn = document.getElementsByClassName('sn-player-btn')[0]
    this.progress = utils.classEle('sn-player-progress')
    this.progressFinish = utils.classEle('sn-player-progress-player')
    this.videoWrapper = utils.classEle('sn-player-video-wrapper')

    this.startAndPause = utils.classEle('sn-player-start-end-box')
    this.startAndPauseStart = utils.classEle('sn-player-start-end-start')
    this.startAndPausePause = utils.classEle('sn-player-start-end-pause')

    this.rollTime = utils.classEle('sn-player-roll-time')
    this.playDot = utils.classEle('sn-player-progress-player-dot')
    this.voiceDot = utils.classEle('sn-player-progress-voice-dot')

    this.voiceBtn = utils.classEle('sn-player-voice-controller')
    this.voiceProgress = utils.classEle('sn-player-voice-progress')
    this.voiceProgressFinish = utils.classEle('sn-player-voice-progress-finish')

    this.voiceNum = utils.classEle('sn-player-voice-number')


    this.progressw = this.progress.getBoundingClientRect().width

    this.init()
    // this.funcToShow()
    this.setValue()

    this.videoFunc()
    // 视频进度条
    this.eventFun()

    // 声音进度条
    this.voiceProgressFun()
  }

  init() {
    this.playerOperate()
    // 总时间
    this.totalTime = utils.formatSeconds(this.playVideo.duration)
    utils.changeInnerText('sn-player-total-time', this.totalTime)

    // 播放时间当前时间
    this.playVideo.ontimeupdate = () => {
      this.currentTime = utils.formatSeconds(this.playVideo.currentTime)
      utils.changeInnerText('sn-player-current-time', this.currentTime)
      // 进度条滚动
      this.progressFinish.style.width = this.progressCalculate() + 'px'
      this.playDot.style.left = this.progressCalculate() + 'px'
    }

    // 播放结束后
    this.playVideo.onended = () => {
      utils.hiddenClass('sn-player-player-pause')
      utils.showClass('sn-player-player-start')
      utils.removeClass(this.startAndPauseStart, 'sn-player-start-end-box-active')
      utils.addClass(this.startAndPausePause, 'sn-player-start-end-box-active')
      this.playing = false
    }

    // 点击任意播放器区域，暂停或开始
    this.videoWrapper.onclick = () => {
      clearTimeout(this.dbClickTimer)
      this.dbClickTimer = setTimeout(() => {
        if (!this.playing) {
          this.playVideo.play()
          utils.hiddenClass('sn-player-player-start')
          utils.showClass('sn-player-player-pause')
          utils.addClass(this.startAndPauseStart, 'sn-player-start-end-box-active')
          utils.removeClass(this.startAndPausePause, 'sn-player-start-end-box-active')
          this.playing = true
        } else {
          this.playVideo.pause()
          utils.hiddenClass('sn-player-player-pause')
          utils.showClass('sn-player-player-start')
          utils.removeClass(this.startAndPauseStart, 'sn-player-start-end-box-active')
          utils.addClass(this.startAndPausePause, 'sn-player-start-end-box-active')
          this.playing = false
        }
      }, 200)
    }

    // 全屏

    this.fullScreen.onclick = () => {
      this.fullScreenFun()
    }

    // 双击全屏或退出全屏
    this.videoWrapper.ondblclick = () => {
      clearTimeout(this.dbClickTimer)
      this.fullScreenFun()
    }

    let currentTime = (offsetY) => {
      return (offsetY / this.progressw * this.playVideo.duration).toFixed(2)
    }
    // 点击进度条，定位到该位置，播放
    this.progress.onclick = (e) => {
      this.playDot.style.left = e.offsetX + 'px'
      this.progressFinish.style.width = this.playDot.style.left
      this.playVideo.currentTime = currentTime(e.offsetX)
    }

    // 声音按钮
    this.voiceFunc()

    this.voiceBtn.onclick = () =>  {
      this.voiceFunc()
    }

  }

  // 声音组件
  voiceFunc() {
    let snPlayerVolume = utils.get('snPlayerVolume')
    console.log(snPlayerVolume, '11')
    this.voiceDot.style.bottom = snPlayerVolume + 'px'
    this.voiceProgressFinish.style.height = snPlayerVolume + 'px'

    if(this.voiceNum.innerHTML <= 0) {
      this.playVideo.volume = snPlayerVolume / 130
      utils.showClass('sn-player-voice-open')
      utils.hiddenClass('sn-player-voice-close')
      utils.changeInnerText('sn-player-voice-number', snPlayerVolume)
    }else {
      utils.hiddenClass('sn-player-voice-open')
      utils.showClass('sn-player-voice-close')
      utils.changeInnerText('sn-player-voice-number', 0)
      this.playVideo.volume = 0 / 130
      this.voiceDot.style.bottom = 0 + 'px'
      this.voiceProgressFinish.style.height = 0 + 'px'
    }
  }


  // 监听事件
  eventFun() {
    // 鼠标移动时，时间随着移动
    this.progress.addEventListener('mouseover', (e) => {
      this.progress.onclick = (e) => {
        this.playDot.style.left = e.offsetX + 'px'
        this.progressFinish.style.width = this.playDot.style.left
        this.playVideo.currentTime = currentTime(e.offsetX)
      }
    })
    this.progress.addEventListener('mousemove', (e) => {
      utils.changeInnerText('sn-player-roll-time', this.progressTime(e.offsetX))
      utils.showClass('sn-player-roll-time')
      this.rollTime.style.left = e.offsetX - 20 + 'px'
    })
    this.progress.addEventListener('mouseout', (e) => {
      // this.playVideo.pause()
      utils.hiddenClass('sn-player-roll-time')
    })

    let playDotFun = (event) => {
      this.playVideo.pause()
      let leftNum = ''
      this.playDot.style.cursor = "pointer";
      let offsetX = parseInt(this.playDot.style.left); // 获取当前的x轴距离
      let innerX = event.clientX - offsetX; // 获取鼠标在方块内的x轴距
      // 鼠标移动的时候不停的修改div的left和top值
      document.onmousemove =  (event) => {
        leftNum = event.clientX - innerX
        this.playDot.style.left = leftNum + "px";
        // 边界判断
        if (parseInt(this.playDot.style.left) <= 0) {
          leftNum = 0
          this.playDot.style.left = "0px";
        }
        if (parseInt(this.playDot.style.left) >= window.innerWidth - parseInt(this.playDot.style.width)) {
          leftNum = window.innerWidth - parseInt(this.playDot.style.width)
          this.playDot.style.left = leftNum + "px";
        }
        this.progressFinish.style.width = this.playDot.style.left
        this.playVideo.currentTime = currentTime(leftNum)


      }
      document.onmouseup =  () => {
        document.onmousemove = null;
        document.onmouseup = null;
        this.progress.onclick = null
        this.playVideo.play()
        // cancel()
      }
    }

    let currentTime = (offsetY) => {
      return (offsetY / this.progressw * this.playVideo.duration).toFixed(2)
    }

    this.playDot.addEventListener('mousedown', playDotFun, false)
    // 滑动


    // // cancel()
    // let cancel = () => {
    //   this.progress.removeEventListener('mousemove')
    //   this.progress.removeEventListener('mouseout')
    // }
  }


  // 声音进度条
  voiceProgressFun() {

    // this.voiceProgress.addEventListener('mousemove', (e) => {
    //   console.log(e.offsetY, 'offsetY')
    //   this.voiceDot.style.top =  e.offsetY + 'px'
    //   // this.voiceProgress.style.height = e.offsetY - 20 + 'px'
    // })
    // this.voiceProgress.addEventListener('mouseout', (e) => {
    //   // this.playVideo.pause()
    //   // utils.hiddenClass('sn-player-roll-time')
    // })



    let voiceDotFun = (event) => {
      let offsetY = parseInt(this.voiceProgress.getBoundingClientRect().top); // 获取当前的y轴距离

      let topNum = ''

      // 鼠标移动的时候不停的修改div的left和top值
      document.onmousemove =  (event) => {
        topNum = 100 - (event.clientY - offsetY)
        this.voiceDot.style.bottom = 100 - (event.clientY - offsetY) + "px";
        // 边界判断
        if (parseInt(this.voiceDot.style.bottom) <= 0) {
          topNum = 0
          this.voiceDot.style.bottom = "0px";
          // 控制按钮
          utils.hiddenClass('sn-player-voice-open')
          utils.showClass('sn-player-voice-close')
        }else {
          utils.showClass('sn-player-voice-open')
          utils.hiddenClass('sn-player-voice-close')
        }

        if (parseInt(this.voiceDot.style.bottom) >= 100) {
          topNum = 100
          this.voiceDot.style.bottom = "100px";
        }

        this.voiceProgressFinish.style.height = topNum + 'px'

        // 赋值
        utils.changeInnerText('sn-player-voice-number', topNum)

        utils.set('snPlayerVolume', topNum)
        // 控制声音
        this.playVideo.volume = topNum / 130


      }
      document.onmouseup =  () => {
        document.onmousemove = null;
        document.onmouseup = null;
        // this.voiceDot.play()
        // cancel()
      }
    }


    this.voiceDot.addEventListener('mousedown', voiceDotFun, false)



    // cancel()
    let cancel = () => {
      this.voiceProgress.removeEventListener('mousemove')
      this.voiceProgress.removeEventListener('mouseout')
    }



  }


  // 计算进度条时间
  progressTime(offsetY) {
    return utils.formatSeconds((offsetY / this.progressw * this.playVideo.duration).toFixed(2))
  }


  // 进度条计算公式
  progressCalculate() {
    return (this.progressw / this.playVideo.duration * this.playVideo.currentTime).toFixed(2)
  }

  // 声音计算公式
  voiceCalculate(Y, y, X) {
    let x =  y / Y * X
     return x
  }

  funcToShow() {
    this.playVideo.onmouseover = () => {
      clearTimeout(this.timer)
      utils.addClass(this.playFunc, 'func-active')
    }

    this.playVideo.onmouseout = () => {
      this.timer = setTimeout(() => {
        utils.removeClass(this.playFunc, 'func-active')
      }, 100)
    }

    this.playFunc.onmouseover = () => {
      clearTimeout(this.timer)
      utils.addClass(this.playFunc, 'func-active')
    }
    this.playFunc.onmouseout = () => {
      this.timer = setTimeout(() => {
        utils.removeClass(this.playFunc, 'func-active')
      }, 100)
    }
  }

  // 全屏
  fullScreenFun() {
    const docElm = document.documentElement
    if (!utils.hasClass(this.el, 'fullscreen-active')) {
      utils.addClass(this.el, 'fullscreen-active')
      utils.addClass(this.playVideo, 'fullscreen-active')
      utils.showClass('snail-player-full-screen-icon')
      utils.hiddenClass('snail-player-fullscreen-btn')
      utils.changeInnerText('fullscreen-icon', '退出全屏')
      utils.addClass(this.playBottom, 'sn-player-fullscreen-bottom-active')
      setTimeout(() => {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (document.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        }
      }, 100)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      utils.removeClass(this.el, 'fullscreen-active')
      utils.removeClass(this.playVideo, 'fullscreen-active')
      utils.hiddenClass('snail-player-full-screen-icon')
      utils.showClass('snail-player-fullscreen-btn')
      utils.changeInnerText('fullscreen-icon', '进入全屏')
      utils.removeClass(this.playBottom, 'sn-player-fullscreen-bottom-active')
    }
  }


  // 设置值
  setValue() {

  }

  videoFunc() {

  }

  // 操作
  playerOperate() {
    this.playerBtn.onclick = () => {
      if (!this.playing) {
        this.playVideo.play()
        utils.hiddenClass('sn-player-player-start')
        utils.showClass('sn-player-player-pause')
        this.playing = true
      } else {
        this.playVideo.pause()
        utils.hiddenClass('sn-player-player-pause')
        utils.showClass('sn-player-player-start')
        this.playing = false
      }
    }
  }

}

export default snailPlayer
