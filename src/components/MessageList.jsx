import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useState, useEffect, useRef } from 'react';

export default function MessageList() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messageRefs = useRef({});

  // Récupérer tous les SMS
  const allSms = useLiveQuery(() => db.sms.orderBy('date').reverse().toArray());

  // Fonction de recherche
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      const query = searchQuery.toLowerCase();

      // Récupérer tous les SMS et filtrer en JavaScript
      const allMessages = await db.sms.toArray();
      console.log('Total messages in DB:', allMessages.length);
      console.log('Search query:', query);

      const results = allMessages.filter(sms => {
        const bodyMatch = sms.body && String(sms.body).toLowerCase().includes(query);
        const nameMatch = sms.contact_name && String(sms.contact_name).toLowerCase().includes(query);
        return bodyMatch || nameMatch;
      });

      console.log('Search results:', results.length);
      setSearchResults(results.sort((a, b) => b.date - a.date));
    };

    performSearch();
  }, [searchQuery]);

  // Fonction pour voir un message dans son contexte
  const viewInContext = (message) => {
    setSelectedContact(message.address);
    setSearchQuery('');
    setHighlightedMessageId(message.id);

    // Scroll vers le message après un court délai pour laisser le temps au DOM de se mettre à jour
    setTimeout(() => {
      if (messageRefs.current[message.id]) {
        messageRefs.current[message.id].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Retirer le highlight après 3 secondes
        setTimeout(() => setHighlightedMessageId(null), 3000);
      }
    }, 100);
  };

  if (!allSms) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (allSms.length === 0) {
    return null;
  }

  // Grouper par contact
  const conversations = allSms.reduce((acc, sms) => {
    const contact = sms.address;
    if (!acc[contact]) {
      acc[contact] = {
        contact: sms.contact_name !== '(Unknown)' ? sms.contact_name : sms.address,
        address: sms.address,
        messages: [],
        lastMessage: sms,
      };
    }
    acc[contact].messages.push(sms);
    if (sms.date > acc[contact].lastMessage.date) {
      acc[contact].lastMessage = sms;
    }
    return acc;
  }, {});

  const conversationList = Object.values(conversations).sort(
    (a, b) => b.lastMessage.date - a.lastMessage.date
  );

  const selectedConversation = selectedContact
    ? conversations[selectedContact]
    : null;

  // Composant pour surligner le texte recherché
  const HighlightedText = ({ text, highlight }) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 font-semibold">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Liste des conversations / Résultats de recherche */}
          <div className="flex flex-col border-r border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="mb-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher dans les messages..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {isSearching ? `Résultats (${searchResults.length})` : `Conversations (${conversationList.length})`}
              </h2>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="divide-y divide-gray-200">
                {isSearching ? (
                  // Résultats de recherche
                  searchResults.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p>Aucun résultat trouvé</p>
                    </div>
                  ) : (
                    searchResults.map((msg) => (
                      <div key={msg.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900">
                            {msg.contact_name !== '(Unknown)' ? msg.contact_name : msg.address}
                          </div>
                          <div className="text-xs text-gray-400">{msg.readable_date}</div>
                        </div>
                        <div className="text-sm text-gray-700 mb-2 break-words">
                          <HighlightedText text={msg.body} highlight={searchQuery} />
                        </div>
                        <button
                          onClick={() => viewInContext(msg)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Voir dans la conversation
                        </button>
                      </div>
                    ))
                  )
                ) : (
                  // Liste des conversations
                  conversationList.map((conv) => (
                    <button
                      key={conv.address}
                      onClick={() => setSelectedContact(conv.address)}
                      className={`
                        w-full p-4 text-left hover:bg-gray-50 transition-colors
                        ${selectedContact === conv.address ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      `}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {conv.contact}
                      </div>
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {conv.lastMessage.body.substring(0, 50)}
                        {conv.lastMessage.body.length > 50 ? '...' : ''}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {conv.messages.length} message{conv.messages.length > 1 ? 's' : ''}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Zone de messages */}
          <div className="lg:col-span-2 flex flex-col bg-gray-50 overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedConversation.contact}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedConversation.address}</p>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                  <div className="space-y-3">
                    {selectedConversation.messages
                      .sort((a, b) => a.date - b.date)
                      .map((msg, idx) => {
                        const isReceived = msg.type === 1;
                        const isHighlighted = highlightedMessageId === msg.id;
                        return (
                          <div
                            key={idx}
                            ref={(el) => {
                              if (el) messageRefs.current[msg.id] = el;
                            }}
                            className={`flex ${isReceived ? 'justify-start' : 'justify-end'} transition-all duration-300 ${isHighlighted ? 'scale-105' : ''}`}
                          >
                            <div
                              className={`
                                max-w-[70%] rounded-2xl px-4 py-2 shadow-sm transition-all duration-300
                                ${isReceived
                                  ? 'bg-white text-gray-800'
                                  : 'bg-blue-600 text-white'
                                }
                                ${isHighlighted ? 'ring-4 ring-yellow-400 shadow-xl' : ''}
                              `}
                            >
                              <div className="break-words whitespace-pre-wrap">
                                {msg.body}
                              </div>
                              <div
                                className={`
                                  text-xs mt-1
                                  ${isReceived ? 'text-gray-500' : 'text-blue-100'}
                                `}
                              >
                                {msg.readable_date}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        Total : {allSms.length} message{allSms.length > 1 ? 's' : ''} importé{allSms.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
