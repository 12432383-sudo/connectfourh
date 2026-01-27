import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, X, Check, Swords, Copy, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFriends, Friend, GameChallenge } from '@/hooks/useFriends';
import { Theme } from '@/types/theme';
import { toast } from '@/hooks/use-toast';

interface FriendsListProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTheme: Theme;
  onChallengeAccepted: (gameId: string) => void;
  onChallengeSent: (gameId: string) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  isOpen,
  onClose,
  selectedTheme,
  onChallengeAccepted,
  onChallengeSent,
}) => {
  const {
    friends,
    pendingRequests,
    incomingChallenges,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    challengeFriend,
    acceptChallenge,
    declineChallenge,
    guestId,
  } = useFriends();

  const [friendCode, setFriendCode] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'challenges'>('friends');

  const handleSendRequest = async () => {
    if (!friendCode.trim()) return;
    
    const result = await sendFriendRequest(friendCode.trim());
    toast({
      title: result.success ? 'Success' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    
    if (result.success) {
      setFriendCode('');
    }
  };

  const handleCopyCode = () => {
    if (guestId) {
      navigator.clipboard.writeText(guestId);
      toast({
        title: 'Copied!',
        description: 'Your friend code has been copied to clipboard',
      });
    }
  };

  const handleChallenge = async (friend: Friend) => {
    const result = await challengeFriend(friend.guestId, selectedTheme);
    if (result.success && result.gameId) {
      toast({
        title: 'Challenge Sent!',
        description: `Waiting for ${friend.displayName} to accept...`,
      });
      onChallengeSent(result.gameId);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send challenge',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptChallenge = async (challenge: GameChallenge) => {
    const result = await acceptChallenge(challenge.id, selectedTheme);
    if (result.success && result.gameId) {
      onChallengeAccepted(result.gameId);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to accept challenge',
        variant: 'destructive',
      });
    }
  };

  const incomingRequests = pendingRequests.filter(r => !r.isRequester);
  const outgoingRequests = pendingRequests.filter(r => r.isRequester);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Friends</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Your Friend Code */}
          <div className="bg-accent/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Your Friend Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-background rounded px-2 py-1 truncate">
                {guestId || 'Loading...'}
              </code>
              <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add Friend */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter friend code..."
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendRequest} size="icon">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-accent/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'friends' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'requests' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === 'challenges' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Challenges
              {incomingChallenges.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {incomingChallenges.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                {/* Friends Tab */}
                {activeTab === 'friends' && (
                  <div className="space-y-2">
                    {friends.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No friends yet. Add some using their friend code!
                      </p>
                    ) : (
                      friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between bg-accent/30 rounded-lg p-3"
                        >
                          <span className="font-medium text-foreground">{friend.displayName}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleChallenge(friend)}
                              className="gap-1"
                            >
                              <Swords className="w-4 h-4" />
                              Challenge
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFriend(friend.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                  <div className="space-y-4">
                    {incomingRequests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Incoming</h3>
                        <div className="space-y-2">
                          {incomingRequests.map((request) => (
                            <div
                              key={request.id}
                              className="flex items-center justify-between bg-accent/30 rounded-lg p-3"
                            >
                              <span className="font-medium text-foreground">{request.displayName}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => acceptFriendRequest(request.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => declineFriendRequest(request.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {outgoingRequests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Sent</h3>
                        <div className="space-y-2">
                          {outgoingRequests.map((request) => (
                            <div
                              key={request.id}
                              className="flex items-center justify-between bg-accent/30 rounded-lg p-3"
                            >
                              <span className="font-medium text-foreground">{request.displayName}</span>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Pending</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pendingRequests.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No pending requests
                      </p>
                    )}
                  </div>
                )}

                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                  <div className="space-y-2">
                    {incomingChallenges.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No incoming challenges
                      </p>
                    ) : (
                      incomingChallenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className="bg-accent/30 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">
                              {challenge.challengerName}
                            </span>
                            <Swords className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAcceptChallenge(challenge)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => declineChallenge(challenge.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
