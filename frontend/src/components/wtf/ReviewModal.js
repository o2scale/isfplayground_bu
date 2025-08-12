import React from 'react';
import { X, Star, Archive, Play, User } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';

const ReviewModal = ({ isOpen, onClose, submission, onPinToWTF, onArchive }) => {
  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{submission.title}</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                {submission.studentName} • {submission.balagruha}
              </p>
            </div>
            <Badge className="text-sm">
              {submission.type === 'voice' ? 'Voice Note' : 'Article'}
            </Badge>
          </div>

          <div className="border-t pt-6">
            {submission.type === 'voice' ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Play className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600 mb-4">Audio Player</p>
                <div className="bg-white rounded p-4 text-sm text-gray-500">
                  Audio player would be embedded here to play: {submission.content}
                </div>
              </div>
            ) : (
              <div className="prose max-w-none bg-white rounded-lg p-6 border">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {submission.content}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <Button
              onClick={() => onPinToWTF(submission)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              Pin to WTF
            </Button>
            <Button
              variant="outline"
              onClick={() => onArchive(submission.id)}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal; 