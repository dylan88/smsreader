import { useState, useRef } from 'react';
import { parseXMLFile, removeDuplicates } from '../utils/xmlParser';
import { db } from '../db';

export default function FileImport({ onImportComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    let allSms = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      try {
        const text = await file.text();
        const smsData = parseXMLFile(text);
        allSms = [...allSms, ...smsData];
      } catch (error) {
        console.error(`Erreur avec le fichier ${file.name}:`, error);
        alert(`Erreur lors du traitement de ${file.name}`);
      }
    }

    // Suppression des doublons dans les fichiers importés
    const uniqueSms = removeDuplicates(allSms);

    // Récupérer tous les SMS existants dans la DB
    const existingSms = await db.sms.toArray();

    // Créer un Set des clés existantes pour une recherche rapide
    const existingKeys = new Set(
      existingSms.map(sms => `${sms.address}-${sms.date}-${sms.body}`)
    );

    // Filtrer les nouveaux SMS qui n'existent pas déjà
    const newSms = uniqueSms.filter(sms => {
      const key = `${sms.address}-${sms.date}-${sms.body}`;
      return !existingKeys.has(key);
    });

    // Sauvegarde dans IndexedDB
    try {
      if (newSms.length > 0) {
        await db.sms.bulkAdd(newSms);
      }

      const totalInDb = await db.sms.count();

      setIsProcessing(false);

      if (newSms.length === 0) {
        alert('Aucun nouveau message à importer (tous les messages étaient déjà présents)');
      } else {
        alert(`${newSms.length} nouveau(x) message(s) importé(s)`);
      }

      onImportComplete(totalInDb);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde dans la base de données');
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.xml')
    );

    if (files.length === 0) {
      alert('Veuillez déposer uniquement des fichiers XML');
      return;
    }

    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les SMS de la base de données ?')) {
      await db.sms.clear();
      onImportComplete(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-4 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isProcessing ? (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-700">
              Traitement en cours...
            </div>
            <div className="text-sm text-gray-500">
              Fichier {progress.current} sur {progress.total}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md mx-auto">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Importez vos fichiers XML
            </h3>
            <p className="text-gray-500 mb-6">
              Glissez-déposez vos fichiers ou cliquez pour sélectionner
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Sélectionner des fichiers
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xml"
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleClearData}
          disabled={isProcessing}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Effacer toutes les données
        </button>
      </div>
    </div>
  );
}
