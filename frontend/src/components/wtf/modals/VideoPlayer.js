import React, { useRef } from "react";
import { X, Eye, Heart, ThumbsUp } from "lucide-react";
import { Dialog, DialogContent } from "../../ui/dialog.jsx";

const VideoPlayer = ({
  isOpen,
  onClose,
  videoSrc,
  title,
  author,
  likes,
  hearts,
  views,
}) => {
  const videoRef = useRef(null);

  const handleVideoPlay = () => {
    setTimeout(() => {
      console.log("Video marked as seen");
    }, 3000);
  };

  const getPostageStampStyle = () => ({
    backgroundImage: `
      radial-gradient(circle at 0% 50%, transparent 4px, white 4px),
      radial-gradient(circle at 100% 50%, transparent 4px, white 4px),
      radial-gradient(circle at 50% 0%, transparent 4px, white 4px),
      radial-gradient(circle at 50% 100%, transparent 4px, white 4px)
    `,
    backgroundSize: "12px 100%, 12px 100%, 100% 12px, 100% 12px",
    backgroundPosition: "left center, right center, center top, center bottom",
    backgroundRepeat: "repeat-y, repeat-y, repeat-x, repeat-x",
    border: "3px solid #d1d5db",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden bg-gray-100">
        <div className="relative min-h-[600px] p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white hover:bg-gray-100 rounded-full p-3 transition-colors shadow-lg border-2 border-gray-300"
          >
            <X className="w-6 h-6 text-purple-600" />
          </button>

          {/* Main video frame */}
          <div
            className="absolute top-12 left-12 bg-white p-4 transform -rotate-1 shadow-lg"
            style={{
              width: "500px",
              ...getPostageStampStyle(),
            }}
          >
            <div className="w-full h-80 bg-black mb-4 overflow-hidden rounded">
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                className="w-full h-full object-cover"
                onPlay={handleVideoPlay}
              />
            </div>
            <div className="text-center">
              <h3 className="font-handwriting text-lg text-gray-800 mb-1">
                {title}
              </h3>
              {author && (
                <p className="text-sm text-gray-600">Performance by {typeof author === 'object' ? author.name : author}</p>
              )}
            </div>
          </div>

          {/* Video sticky note */}
          <div className="absolute top-16 right-16 w-64 h-64 bg-blue-200 p-6 transform rotate-2 shadow-lg">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full shadow-md"></div>
            <div className="h-full flex flex-col justify-center items-center text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h2
                className="text-blue-700 font-bold text-xl mb-2"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                VIDEO
              </h2>
              <p className="text-blue-600 font-semibold text-sm mb-4">
                Watch & Learn
              </p>
              <p className="text-gray-700 text-sm">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-blue-600 text-xs mt-2">#video #content</p>
            </div>
          </div>

          {/* Stats card */}
          <div className="absolute bottom-16 right-12 bg-white p-6 transform rotate-1 shadow-lg border-2 border-gray-200 rounded-lg">
            <div className="space-y-4 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {views.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-pink-500">
                <ThumbsUp className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {likes.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-pink-600">
                <Heart className="w-5 h-5" />
                <span className="font-bold text-lg">{hearts}</span>
              </div>
            </div>
          </div>

          {/* Decorative tape strips */}
          <div className="absolute top-32 left-96 w-24 h-6 bg-yellow-300 bg-opacity-70 transform rotate-12 shadow-sm"></div>
          <div className="absolute top-80 right-80 w-32 h-6 bg-yellow-300 bg-opacity-70 transform -rotate-6 shadow-sm"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;
