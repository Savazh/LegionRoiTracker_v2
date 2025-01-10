import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { Comment, PricePrediction } from '../types';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

interface SocialFeaturesProps {
  tokenId: string;
}

export function SocialFeatures({ tokenId }: SocialFeaturesProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [predictionPrice, setPredictionPrice] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function initConnection() {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      if (!connected) {
        setError('Unable to connect to the database. Please try again later.');
      }
    }
    initConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchSocialData();
    }
  }, [tokenId, timeframe, isConnected]);

  async function fetchSocialData() {
    setLoading(true);
    try {
      let query = supabase
        .from('comments')
        .select('*')
        .eq('token_id', tokenId)
        .order('created_at', { ascending: false });

      if (timeframe !== 'all') {
        const date = new Date();
        if (timeframe === 'day') date.setDate(date.getDate() - 1);
        if (timeframe === 'week') date.setDate(date.getDate() - 7);
        if (timeframe === 'month') date.setMonth(date.getMonth() - 1);
        query = query.gte('created_at', date.toISOString());
      }

      const { data: commentsData, error: commentsError } = await query;
      if (commentsError) throw commentsError;
      if (commentsData) setComments(commentsData);

      const { data: predictionsData, error: predictionsError } = await supabase
        .from('price_predictions')
        .select('*')
        .eq('token_id', tokenId)
        .order('created_at', { ascending: false });

      if (predictionsError) throw predictionsError;
      if (predictionsData) setPredictions(predictionsData);
    } catch (error) {
      console.error('Error fetching social data:', error);
      setError('Failed to load social data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !newComment.trim()) {
      alert('Please enter both a nickname and a comment');
      return;
    }

    try {
      const { error } = await supabase.from('comments').insert({
        token_id: tokenId,
        content: newComment.trim(),
        nickname: nickname.trim()
      });

      if (error) throw error;

      setNewComment('');
      fetchSocialData();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  }

  async function handlePredictionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !predictionPrice || !targetDate) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase.from('price_predictions').insert({
        token_id: tokenId,
        predicted_price: parseFloat(predictionPrice),
        target_date: new Date(targetDate).toISOString(),
        nickname: nickname.trim()
      });

      if (error) throw error;

      setPredictionPrice('');
      setTargetDate('');
      fetchSocialData();
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Failed to submit prediction. Please try again.');
    }
  }

  async function handleVote(type: 'comment' | 'prediction', id: string, direction: 'up' | 'down') {
    try {
      const table = type === 'comment' ? 'comments' : 'price_predictions';
      const { error } = await supabase
        .from(table)
        .update({ votes: direction === 'up' ? 1 : -1 })
        .eq('id', id);

      if (error) throw error;
      fetchSocialData();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  }

  if (error) {
    return (
      <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
        <p className="text-pink-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Filter */}
      <div className="flex gap-2 mb-4">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100"
        >
          <option value="all">All Time</option>
          <option value="day">Last 24h</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      {/* Comments Section */}
      <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
        <h2 className="text-xl font-semibold text-pink-500 mb-4">Community Discussion</h2>
        
        <form onSubmit={handleCommentSubmit} className="mb-4 space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100"
            placeholder="Enter your nickname"
            maxLength={50}
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100"
            placeholder="Add a comment..."
            rows={3}
            maxLength={1000}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
          >
            Post Comment
          </button>
        </form>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-black/40 rounded-lg"></div>
            <div className="h-20 bg-black/40 rounded-lg"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex justify-between items-start">
                  <span className="text-cyan-300">{comment.nickname}</span>
                  <span className="text-cyan-500/60 text-sm">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-cyan-100">{comment.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleVote('comment', comment.id, 'up')}
                    className="text-cyan-400 hover:text-pink-400"
                  >
                    <ArrowBigUp size={20} />
                  </button>
                  <span className="text-cyan-300">{comment.votes}</span>
                  <button
                    onClick={() => handleVote('comment', comment.id, 'down')}
                    className="text-cyan-400 hover:text-pink-400"
                  >
                    <ArrowBigDown size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Predictions Section */}
      <div className="bg-black/20 p-6 rounded-lg border border-cyan-500/10">
        <h2 className="text-xl font-semibold text-pink-500 mb-4">Price Predictions</h2>
        
        <form onSubmit={handlePredictionSubmit} className="mb-4 space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100"
            placeholder="Enter your nickname"
            maxLength={50}
          />
          <input
            type="number"
            value={predictionPrice}
            onChange={(e) => setPredictionPrice(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100"
            placeholder="Enter predicted price..."
            step="0.000001"
            min="0"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-md text-cyan-100"
            min={new Date().toISOString().split('T')[0]}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
          >
            Submit Prediction
          </button>
        </form>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-black/40 rounded-lg"></div>
            <div className="h-20 bg-black/40 rounded-lg"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-4 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex justify-between items-start">
                  <span className="text-cyan-300">{prediction.nickname}</span>
                  <span className="text-cyan-500/60 text-sm">
                    {new Date(prediction.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-cyan-100">
                    Predicted Price: ${prediction.predicted_price.toFixed(6)}
                  </p>
                  <p className="text-cyan-300/60">
                    Target Date: {new Date(prediction.target_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleVote('prediction', prediction.id, 'up')}
                    className="text-cyan-400 hover:text-pink-400"
                  >
                    <ArrowBigUp size={20} />
                  </button>
                  <span className="text-cyan-300">{prediction.votes}</span>
                  <button
                    onClick={() => handleVote('prediction', prediction.id, 'down')}
                    className="text-cyan-400 hover:text-pink-400"
                  >
                    <ArrowBigDown size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}