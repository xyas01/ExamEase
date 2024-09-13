import React, { useState } from 'react';

const CLD = ({onSubmitCLD}) => {
    const [numResponses, setNumResponses] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0); // New state for total points
    const [responses, setResponses] = useState([]);
    const [image, setImage] = useState(null);
    const [formattedResponses, setFormattedResponses] = useState([]);
    const [randomizedResponses, setRandomizedResponses] = useState([]);
    const [isFormatted, setIsFormatted] = useState(false); // Toggle visibility of inputs

    // Handle number of responses change
    const handleNumResponsesChange = (e) => {
        const number = parseInt(e.target.value);
        setNumResponses(number);
        setResponses(Array(number).fill(''));
    };

    // Handle total points change
    const handleTotalPointsChange = (e) => {
        const points = parseFloat(e.target.value);
        setTotalPoints(points);
    };

    // Handle response input change
    const handleResponseChange = (index, value) => {
        const updatedResponses = [...responses];
        updatedResponses[index] = value;
        setResponses(updatedResponses);
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
      
          try {
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
      
            if (response.ok) {
              setImage(data.imageUrl); // Store the server path to the image
            } else {
              console.error(data.error);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      };
      

    // Handle formatting the exercise
    const handleFormatExercise = () => {
        // Fisher-Yates Shuffle for better randomization
        const shuffleArray = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };
      
        let shuffledResponses = shuffleArray(responses);
      
        // Ensure shuffledResponses is actually different from responses
        while (JSON.stringify(shuffledResponses) === JSON.stringify(responses)) {
          shuffledResponses = shuffleArray(responses);
        }
      
        // Set the shuffled responses
        setRandomizedResponses(shuffledResponses);
      
        // Prepare formatted responses for drag and drop
        setFormattedResponses(Array(numResponses).fill(''));
      
        // Hide the inputs after formatting
        setIsFormatted(true);
      
        // Submit the formatted exercise data
        onSubmitCLD({
          totalPoints,
          responses,
          shuffledResponses,
          image,
        });
      };
      

    // Handle drag and drop ordering
    const handleDrop = (index, event) => {
        event.preventDefault(); // Prevent default behavior
        const droppedItem = event.dataTransfer.getData('text/plain');
        const updatedFormattedResponses = [...formattedResponses];
        updatedFormattedResponses[index] = droppedItem;
        setFormattedResponses(updatedFormattedResponses);
    };

    // Allow dropping by preventing default behavior on dragOver
    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>

            {/* Only show inputs if the exercise is not yet formatted */}
            {!isFormatted && (
                <>
                <h2 className="text-lg">Compléter le dessin : <strong>({totalPoints} pts)</strong></h2>
                    <div className="flex gap-4">
                        {/* Number of responses input */}
                    <div className="mb-4">
                        <label className="block mb-2">Nombre de réponses :</label>
                        <input
                            type="number"
                            value={numResponses}
                            onChange={handleNumResponsesChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>


                        {/* Total points input */}
                    <div className="mb-4">
                        <label className="block mb-2">Total points :</label>
                        <input
                            type="number"
                            value={totalPoints}
                            onChange={handleTotalPointsChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    </div>

                    
                    {/* Responses inputs */}
                    <div className="mb-4">
                        {responses.map((response, index) => (
                            <div key={index} className="mb-2">
                                <label>{`Réponse ${index + 1} :`}</label>
                                <input
                                    type="text"
                                    value={response}
                                    onChange={(e) => handleResponseChange(index, e.target.value)}
                                    className="border rounded px-2 py-1 ml-2"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Image upload */}
                    <div className="mb-4">
                        <label className="block mb-2">Télécharger l'image :</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="border rounded px-2 py-1" />
                    </div>
                </>
            )}

            {/* Format exercise button */}
            {!isFormatted && (
                <button onClick={handleFormatExercise} className="bg-sky-500 text-white px-4 py-2 rounded-lg">
                    Formatter
                </button>
            )}

            {/* Display formatted exercise */}
            {isFormatted && randomizedResponses.length > 0 && (
                <div className="">
                    <div className="flex justify-center m-4 gap-2">
                        {randomizedResponses.map((response, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', response)}
                                className="cursor-pointer border text-white rounded-xl px-4 py-2 bg-sky-500"
                            >
                                {response}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 ">
                        <div>
                            {formattedResponses.map((response, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <p>{index + 1}- </p>
                                    <div
                                        className="border p-2 rounded bg-gray-100 min-w-[150px]"
                                        onDrop={(e) => handleDrop(index, e)}
                                        onDragOver={handleDragOver}
                                    >
                                        {response || `Glissez une réponse ici`}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {image && (
                            <div className="flex">
                                <img src={image} alt="Uploaded drawing" className="max-w-full h-auto border rounded" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CLD;
