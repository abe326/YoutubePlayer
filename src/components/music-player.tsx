"use client"

import { useState, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, List } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Playlist } from "./playlist"

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [videoId, setVideoId] = useState("")
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)

  // YouTubeプレイヤーインスタンス（ダミー）
  const player = useRef(null)

  // リピートの切り替え
  const toggleRepeat = () => setIsRepeat(!isRepeat)

  // シャッフルの切り替え
  const toggleShuffle = () => setIsShuffle(!isShuffle)

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 p-6">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">現在再生中: Never Gonna Give You Up</h2>
          <p className="text-muted-foreground">Rick Astley</p>
        </div>
        <div className="mt-6">
          <Slider
            defaultValue={[33]}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm mt-1">
            <span>1:23</span>
            <span>3:32</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            <Slider
              defaultValue={[66]}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowPlaylist(!showPlaylist)}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {showPlaylist && (
        <div className="w-full md:w-80 bg-secondary p-4">
          <h3 className="text-lg font-semibold mb-4">プレイリスト</h3>
          <ScrollArea className="h-[calc(100vh-8rem)] scrollbar">
            <Playlist
              player={player.current}
              setVideoId={setVideoId}
              currentVideoId={videoId}
              isRepeat={isRepeat}
              isShuffle={isShuffle}
              toggleRepeat={toggleRepeat}
              toggleShuffle={toggleShuffle}
            />
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
