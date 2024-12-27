"use client"

import { useState, useEffect, useCallback } from 'react'
import { Plus, Play, Shuffle, Trash, XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { YouTubePlayer } from 'react-youtube'

interface PlaylistItem {
  id: string
  title: string
}

interface PlaylistProps {
  player: YouTubePlayer
  setVideoId: (id: string) => void
  currentVideoId: string
  isRepeat: boolean
  isShuffle: boolean // 追加
  toggleRepeat: () => void
  toggleShuffle: () => void // 追加
}

export function Playlist({
  player,
  setVideoId,
  currentVideoId,
  isRepeat,
}: PlaylistProps) {
  const [playlists, setPlaylists] = useState<{ [key: string]: PlaylistItem[] }>(() => {
    const savedPlaylists = localStorage.getItem('playlists')
    return savedPlaylists ? JSON.parse(savedPlaylists) : { 'お気に入り': [], '最近再生した曲': [] }
  })

  const [currentPlaylist, setCurrentPlaylist] = useState('お気に入り')
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists))
  }, [playlists])

  const addToPlaylist = () => {
    if (!currentPlaylist || !playlists[currentPlaylist]) return
    if (player) {
      const videoData = player.getVideoData()
      const newItem = { id: videoData.video_id, title: videoData.title }
      setPlaylists((prev) => ({
        ...prev,
        [currentPlaylist]: [...prev[currentPlaylist], newItem],
      }))
    }
  }

  const createNewPlaylist = () => {
    if (newPlaylistName && !playlists[newPlaylistName]) {
      setPlaylists((prev) => ({
        ...prev,
        [newPlaylistName]: [],
      }))
      setCurrentPlaylist(newPlaylistName)
      setNewPlaylistName('')
    }
  }

  const deletePlaylist = () => {
    const remainingPlaylists = { ...playlists }
    delete remainingPlaylists[currentPlaylist]
    setPlaylists(remainingPlaylists)
    setCurrentPlaylist(Object.keys(remainingPlaylists)[0] || '')
  }

  const removeFromPlaylist = (index: number) => {
    setPlaylists((prev) => ({
      ...prev,
      [currentPlaylist]: prev[currentPlaylist].filter((_, i) => i !== index),
    }))
  }

  const shufflePlaylist = useCallback(() => {
    if (!currentPlaylist || !playlists[currentPlaylist]) return

    const currentPlaylistItems = [...playlists[currentPlaylist]]
    for (let i = currentPlaylistItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[currentPlaylistItems[i], currentPlaylistItems[j]] = [currentPlaylistItems[j], currentPlaylistItems[i]]
    }

    setPlaylists((prev) => ({
      ...prev,
      [currentPlaylist]: currentPlaylistItems,
    }))
  }, [currentPlaylist, playlists])

  const playNext = useCallback(() => {
    if (!currentPlaylist || !playlists[currentPlaylist]?.length) return

    const currentPlaylistItems = playlists[currentPlaylist]
    const nextIndex = (currentIndex + 1) % currentPlaylistItems.length
    setCurrentIndex(nextIndex)
    setVideoId(currentPlaylistItems[nextIndex].id)
  }, [currentIndex, currentPlaylist, playlists, setVideoId])

  useEffect(() => {
    if (player) {
      player.addEventListener('onStateChange', (event: { data: number }) => {
        if (event.data === 0) {
          if (isRepeat) {
            player.seekTo(0)
            player.playVideo()
          } else {
            playNext()
          }
        }
      })
    }
  }, [player, isRepeat, playNext])

  return (
<div className="h-full flex flex-col text-white">
    {/* ボタンと入力フォームを横一列に配置 */}
    <div className="flex items-center gap-4 mb-4">
      <Select value={currentPlaylist} onValueChange={setCurrentPlaylist}>
        <SelectTrigger className="w-[180px] bg-gray-700 border-none text-white">
          <SelectValue placeholder="プレイリストを選択" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(playlists).map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="text"
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        placeholder="新しいプレイリスト名"
        className="bg-gray-700 text-white border-none flex-grow"
      />
      <Button onClick={createNewPlaylist} className="bg-blue-500 hover:bg-blue-600">
        作成
      </Button>
      <Button variant="destructive" onClick={deletePlaylist} className="text-white">
        <XCircle className="h-4 w-4 mr-2" />
        現在のプレイリストを削除
      </Button>
      <Button variant="ghost" onClick={addToPlaylist} className="text-white">
        <Plus className="h-4 w-4 mr-2" />
        再生中の曲を追加
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={shufflePlaylist}
        className="text-white"
      >
        <Shuffle className="h-4 w-4" />
      </Button>
    </div>

    {/* プレイリスト一覧 */}
    <ul className="space-y-1 overflow-y-auto scrollbar">
      {playlists[currentPlaylist]?.map((item, index) => (
        <li
          key={`${item.id}-${index}`}
          className="flex items-center justify-between p-1 hover:bg-gray-700 rounded-md"
        >
          <span className="truncate text-sm">{item.title}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVideoId(item.id)}
              className={`text-white ${currentVideoId === item.id ? 'bg-blue-500' : ''}`}
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFromPlaylist(index)}
              className="text-red-500"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  </div>
  )
}
