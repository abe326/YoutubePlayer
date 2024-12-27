"use client"

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, List, Repeat } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Playlist } from "./playlist"
import YouTube, { YouTubePlayer } from 'react-youtube'

export function MusicPlayer() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [currentSong, setCurrentSong] = useState({ title: '' })
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  // const [playlist, setPlaylist] = useState<{ id: string; title: string }[]>([])
  // const [currentIndex, setCurrentIndex] = useState(0)
  const [range, setRange] = useState<[number, number]>([0, 0]) // リピート範囲
  const [isVideoLoaded, setIsVideoLoaded] = useState(false) // 動画がロードされたかどうか
  const progressInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (player && isPlaying) {
      progressInterval.current = setInterval(() => {
        const time = player.getCurrentTime()
        setCurrentTime(time)

        // リピート範囲内で再生
        if (isRepeat && range[1] > 0 && time >= range[1]) {
          player.seekTo(range[0])
        }
      }, 500)
    } else {
      clearInterval(progressInterval.current)
    }
    return () => clearInterval(progressInterval.current)
  }, [player, isPlaying, isRepeat, range])

  const onReady = (event: { target: YouTubePlayer }) => {
    const target = event.target
    setPlayer(target)
    setDuration(target.getDuration())
    const videoData = target.getVideoData()
    setCurrentSong({ title: videoData.title })
    setRange([0, target.getDuration()]) // 初期状態で全範囲
    setIsVideoLoaded(true) // 動画がロードされたことを示す
  }

  const onStateChange = (event: { data: number }) => {
    // YouTube APIの状態を監視し、再生状態を反映
    if (event.data === 1) { // 再生中
      setIsPlaying(true)
    } else if (event.data === 2) { // 一時停止中
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      player?.pauseVideo()
    } else {
      player?.playVideo()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgress = (value: number[]) => {
    const newTime = value[0]
    player?.seekTo(newTime)
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    player?.setVolume(newVolume)
    setVolume(newVolume)
  }

  const handleRangeChange = (value: number[]) => {
    setRange([value[0], value[1]])
  }

  const skipToStart = () => {
    player?.seekTo(0)
    setCurrentTime(0)
  }

  const skipToEnd = () => {
    if (duration > 1) {
      player?.seekTo(duration - 1)
      setCurrentTime(duration - 1)
    }
  }

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[1].length === 11 ? match[1] : null
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const extractedId = extractVideoId(url)
    if (extractedId) {
      if (extractedId === videoId) {
        // 同じ動画IDの場合は動画の先頭に戻して再生
        player?.seekTo(0)
        setCurrentTime(0)
        setIsPlaying(true)
        player?.playVideo()
      } else {
        // 新しい動画IDの場合はロード
        setVideoId(extractedId)
        setIsVideoLoaded(false) // 新しい動画がロードされるまで無効
      }
    } else {
      alert('無効なYouTube URLです')
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto scrollbar">
        <div>
          <form onSubmit={handleUrlSubmit} className="mb-4 flex">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube URLを入力"
              className="bg-gray-700 text-white border-none flex-grow mr-2"
            />
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Load</Button>
          </form>
          <div className="hidden">
            <YouTube
              videoId={videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              onReady={onReady}
              onStateChange={onStateChange}
            />
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{currentSong.title || '再生中の曲はありません'}</h2>
        </div>
        <div className="mb-8">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleProgress}
            className="w-full"
          />
          <div className="flex justify-between text-sm mt-1 text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="mb-8">
          <Slider
            value={range}
            max={duration}
            step={1}
            onValueChange={handleRangeChange}
            disabled={!isRepeat}
            className={`w-full ${isRepeat ? 'bg-blue-500' : 'bg-gray-700'} rounded-full h-2`}
            aria-label="リピート範囲のスライダー"
          />
          <div className="flex justify-between text-sm mt-1 text-gray-400">
            <span>開始: {formatTime(range[0])}</span>
            <span>終了: {formatTime(range[1])}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={skipToStart} className="text-white" disabled={!isVideoLoaded}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white" disabled={!isVideoLoaded}>
            {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={skipToEnd} className="text-white" disabled={!isVideoLoaded}>
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setShowPlaylist(!showPlaylist)} className="text-white">
            <List className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRepeat(!isRepeat)}
            className={`text-white ${isRepeat ? 'bg-blue-500' : ''}`}
          >
            <Repeat className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {showPlaylist && (
        <div className="h-1/2 bg-gray-800 p-4 overflow-hidden">
          <Playlist
            player={player}
            setVideoId={setVideoId}
            currentVideoId={videoId}
            isShuffle={isShuffle}
            isRepeat={isRepeat}
            toggleShuffle={() => setIsShuffle(!isShuffle)}
            toggleRepeat={() => setIsRepeat(!isRepeat)}
          />
        </div>
      )}
    </div>
  )
}
