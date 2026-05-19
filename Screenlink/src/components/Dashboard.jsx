// src/components/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  doc,
  deleteDoc 
} from "firebase/firestore";
import { 
  Link, 
  Clapperboard, 
  Calendar,
  Clock,
  Play,
  ExternalLink,
  Copy,
  RefreshCw,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

// Skeleton component for loading state
const VideoCardSkeleton = () => (
  <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-800 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-800 rounded w-16"></div>
        <div className="h-8 bg-gray-800 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-full flex items-center justify-center">
      <Clapperboard className="w-12 h-12 text-purple-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">No recordings yet</h3>
    <p className="text-gray-400 mb-6 max-w-md mx-auto">
      Start recording your screen to see your videos here. All your recordings will be automatically saved and organized.
    </p>
    <div className="inline-flex items-center gap-2 text-sm text-purple-400 bg-purple-900/30 px-4 py-2 rounded-lg">
      <Play className="w-4 h-4" />
      Ready to record your first video?
    </div>
  </div>
);

// Confirmation Modal Component
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, videoTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Delete Recording</h3>
        </div>
        
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-medium text-white">"{videoTitle}"</span>? 
          This action cannot be undone.
        </p>
        
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Video card component
const VideoCard = ({ video, onCopyLink, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVideoClick = () => {
    setShowVideo(true);
    setIsPlaying(true);
  };

  const handleVideoClose = () => {
    setShowVideo(false);
    setIsPlaying(false);
  };

  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true);
    setThumbnailError(false);
  };

  const handleThumbnailError = () => {
    setThumbnailError(true);
    setThumbnailLoaded(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(video.id);
      setShowDeleteModal(false);
      toast.success("Recording deleted successfully!");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete recording. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const videoTitle = video.title || `Recording ${formatDate(video.createdAt)}`;

  return (
    <>
      <div className="group bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
        {/* Video Thumbnail */}
        <div 
          className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden cursor-pointer"
          onClick={handleVideoClick}
        >
          {/* Actual Video Thumbnail */}
          <video
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              thumbnailLoaded && !thumbnailError ? 'opacity-100' : 'opacity-0'
            }`}
            preload="metadata"
            muted
            onLoadedData={handleThumbnailLoad}
            onError={handleThumbnailError}
            poster=""
            style={{ pointerEvents: 'none' }}
          >
            <source src={`${video.videoURL}#t=0.5`} type="video/webm" />
            <source src={`${video.videoURL}#t=0.5`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Fallback Thumbnail */}
          {(!thumbnailLoaded || thumbnailError) && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Clapperboard className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-400 text-xs">Loading preview...</p>
              </div>
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300">
              <Play className="w-8 h-8 text-gray-900 ml-1" />
            </div>
          </div>

          {/* Recording indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2 opacity-80">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">REC</span>
          </div>

          {/* Duration badge (if available) */}
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
              {video.duration}
            </div>
          )}

          {/* Loading indicator */}
          {!thumbnailLoaded && !thumbnailError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {videoTitle}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(video.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            
            <button
              onClick={() => onCopyLink(video.videoURL)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        videoTitle={videoTitle}
        isDeleting={isDeleting}
      />

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={handleVideoClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            <video
              className="w-full rounded-xl shadow-2xl"
              controls
              autoPlay
              preload="metadata"
            >
              <source src={video.videoURL} type="video/webm" />
              <source src={video.videoURL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

const Dashboard = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch videos with real-time updates
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "videos"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const videoList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setVideos(videoList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos. Please try again.");
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      const q = query(
        collection(db, "videos"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const videoList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videoList);
      toast.success("Videos refreshed!");
    } catch (error) {
      console.error("Error refreshing videos:", error);
      toast.error("Failed to refresh videos.");
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Delete video function
  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteDoc(doc(db, "videos", videoId));
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error deleting video:", error);
      throw error; // Re-throw to handle in the VideoCard component
    }
  };

  // Copy link function
  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("🔗 Link copied to clipboard!");
    } catch (err) {
      toast.error("❌ Failed to copy link");
    }
  };

  return (
   <div className="min-h-screen bg-black">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    {/* Header */}
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Title & Count */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
           <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
  Your Recordings
</h1>

          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            {loading
              ? "Loading your recordings..."
              : `${videos.length} recording${videos.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors duration-200 hover:shadow-sm disabled:opacity-50 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>

    {/* Content */}
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    ) : videos.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onCopyLink={copyLink}
            onDelete={handleDeleteVideo}
          />
        ))}
      </div>
    )}
  </div>
</div>

  );
};

export default Dashboard;