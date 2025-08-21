'use client'
import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Download, ImageIcon } from 'lucide-react';
import { downloadAllImages, downloadImage } from '@/services/data/data_services';

type ImagesGroupProps = {
  images: string[];
  maxHeight?: number;
  className?: string;
};

export default function ImagesGroup({
  images,
  maxHeight = 250,
  className = "",
}: ImagesGroupProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorList, setErrorList] = useState<number[]>([])

  const openLightbox = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => setSelectedImage(null);

  const nextImage = () =>
    setImageByIndex((currentIndex + 1) % images.length);

  const prevImage = () =>
    setImageByIndex((currentIndex - 1 + images.length) % images.length);

  const setImageByIndex = (index: number) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const shouldShowOverlay = (index: number) =>
    images.length > 5 && index === 4;

  const visibleImages = images.length > 5 ? images.slice(0, 5) : images;

  if (!images.length) {
    return (
      <div className="bg-gray-100 dark:bg-black rounded-lg p-8 text-center text-gray-500 dark:text-gray-100">
        No images to display
      </div>
    );
  }

  return (
    <>
      <div className={`w-fill ${className} py-2 px-1`}>
        {/* Image grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(0, 1fr))`,
          }}
        >
          {visibleImages.map((image, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800`}
              style={{ height: `${maxHeight}px` }}
              onClick={() => {
                if (!errorList.includes(index)) {
                  openLightbox(image, index)
                }
              }}
            >
              {errorList.includes(index)
                ? <div className='flex justify-center items-center h-full'>
                  <ImageIcon />
                </div>
                : <img
                src={image}
                onError={() => setErrorList(prev => [...prev, index])}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />}

              {/* Download individual image */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(image, `image-${index + 1}.jpg`);
                }}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
              >
                <Download className="w-3.5 h-3.5 text-gray-700" />
              </button>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white dark:text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* "Show more" overlay */}
              {shouldShowOverlay(index) && (
                <div className="absolute inset-0 bg-black/60 dark:bg-black/40 flex items-center justify-center">
                  <span className="text-white dark:text-black text-xl font-semibold">
                    +{images.length - 5}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls under grid */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </div>
          {images.length > 1 ? (
            <button
              onClick={() => downloadAllImages(images)}
              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download All</span>
            </button>
          ) : (
            <button
              onClick={() => downloadImage(images[0], 'image.jpg')}
              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close / Download */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <button
                onClick={() => downloadImage(selectedImage, `image-${currentIndex + 1}.jpg`)}
                className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={closeLightbox}
                className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Main image */}
            <img
              src={selectedImage}
              alt="Selected image"
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
