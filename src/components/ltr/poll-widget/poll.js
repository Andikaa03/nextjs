import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { votePoll } from '@/services/pollService';

const dictionary = {
    en: {
        title: 'Opinion Poll',
        vote: 'Vote',
        dummyQuestion: 'Do you think this decision is correct?',
        dummyOptions: [
            { id: 1, text: 'Yes, I agree' },
            { id: 2, text: 'No, I disagree' },
            { id: 3, text: 'No comment' }
        ],
        submitted: 'Thank you for your vote!',
        selectFirst: 'Please select an option first.'
    },
    bn: {
        title: 'জনমত জরিপ',
        vote: 'ভোট দিন',
        dummyQuestion: 'আপনি কি মনে করেন এই সিদ্ধান্ত সঠিক?',
        dummyOptions: [
            { id: 1, text: 'হ্যাঁ, আমি একমত' },
            { id: 2, text: 'না, আমি একমত নই' },
            { id: 3, text: 'মন্তব্য নেই' }
        ],
        submitted: 'আপনার ভোটের জন্য ধন্যবাদ!',
        selectFirst: 'প্রথমে একটি বিকল্প নির্বাচন করুন।'
    }
};

const PollWidget = ({ data = null, isLoading = false }) => {
    const { locale } = useLanguage();
    const t = dictionary[locale] || dictionary.bn;
    
    const dummyPoll = {
        question: t.dummyQuestion,
        options: t.dummyOptions
    };

    const [pollData, setPollData] = useState(dummyPoll);
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [pollId, setPollId] = useState(null);

    useEffect(() => {
        if (isLoading) {
            setPollData({
                question: t.dummyQuestion,
                options: t.dummyOptions
            });
            setPollId(null);
        } else if (data) {
            const p = data.attributes || data;
            setPollId(data.id || null);
            setPollData({
                question: p.question,
                options: p.options || []
            });
            
            // Check if user already voted for this poll
            if (data.id && typeof window !== 'undefined') {
                const voted = localStorage.getItem(`voted_poll_${data.id}`);
                if (voted) setHasVoted(true);
            }
        }
    }, [data, isLoading, locale]);

    const handleVote = async (e) => {
        e.preventDefault();
        if (selectedOption === null) {
            alert(t.selectFirst);
            return;
        }
        
        if (hasVoted || isVoting || isLoading) return;
        
        setIsVoting(true);
        if (pollId && !isLoading) {
            try {
                const res = await votePoll(pollId, selectedOption);
                if (res && res.data) {
                    setHasVoted(true);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(`voted_poll_${pollId}`, 'true');
                    }
                    // Update UI optimistically
                    const updatedOptions = [...pollData.options];
                    if (updatedOptions[selectedOption]) {
                         updatedOptions[selectedOption].voteCount = (updatedOptions[selectedOption].voteCount || updatedOptions[selectedOption].votes || 0) + 1;
                    }
                    setPollData({...pollData, options: updatedOptions});
                }
            } catch (err) {
                console.error("Failed to submit vote:", err);
            }
        } else if (isLoading) {
            // Fake vote for dummy mode
            setHasVoted(true);
        }
        setIsVoting(false);
    };

    if (!isLoading && !data) return null; // Hide if no poll

    return (
        <div className="panel_inner poll-widget">
            <div className="panel_header">
                <h4>
                    <strong>{t.title}</strong>
                </h4>
            </div>
            <div className="panel_body poll-content">
                <form id="home_poll" onSubmit={handleVote}>
                    <h6 style={{ fontSize: '18px', marginBottom: '16px', lineHeight: '1.4' }}>{pollData.question}</h6>
                    <ul>
                        {pollData.options.map((option, index) => {
                            const totalVotes = pollData.options.reduce((sum, opt) => sum + (opt.voteCount || opt.votes || 0), 0);
                            const percent = totalVotes > 0 ? Math.round(((option.voteCount || option.votes || 0) / totalVotes) * 100) : 0;
                            return (
                                <li key={option.id || index}>
                                    <input
                                        id={`poll_${index}`}
                                        name="poll"
                                        type="radio"
                                        value={index}
                                        checked={selectedOption === index}
                                        onChange={() => setSelectedOption(index)}
                                        disabled={hasVoted || isVoting}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <label htmlFor={`poll_${index}`} style={{ cursor: hasVoted ? 'default' : 'pointer', width: '90%' }}>
                                        {option.text || option.optionText} 
                                        {hasVoted && (
                                            <div style={{ marginTop: '5px', width: '100%', backgroundColor: '#eee', borderRadius: '4px', height: '10px' }}>
                                                <div style={{ width: `${percent}%`, backgroundColor: '#eb0254', height: '10px', borderRadius: '4px' }}></div>
                                                <span style={{ fontSize: '11px', float: 'right', marginTop: '2px' }}>{percent}% ({option.voteCount || option.votes || 0})</span>
                                            </div>
                                        )}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                    {!hasVoted ? (
                        <button type="submit" className="btn btn-news" disabled={isVoting} style={{ border: 'none', cursor: 'pointer' }}>
                            {isVoting ? '...' : t.vote}
                        </button>
                    ) : (
                        <p className="text-success mt-2 font-weight-bold">{t.submitted}</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PollWidget;