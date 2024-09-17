import React from 'react';
import Logout from '../../assets/Logout.svg'; // Make sure you have this SVG file

const Grade = ({ score, totalPoints, passingScore, details, isFullLoading }) => {
    const getGradeMessage = () => {
        if (totalPoints === 20) {
            if (score < 10) {
                return {
                    message: "Bonne chance la prochaine fois !",
                    emoji: "😢",
                    motivation: "Ne vous découragez pas, vous pouvez le faire !",
                    color: "text-red-500"
                };
            } else if (score >= 10 && score < 12) {
                return {
                    message: "Passable",
                    emoji: "😐",
                    motivation: "Il y a de la place pour s'améliorer, continuez comme ça !",
                    color: "text-yellow-500"
                };
            } else if (score >= 12 && score < 14) {
                return {
                    message: "Assez bien",
                    emoji: "🙂",
                    motivation: "Bon travail ! Vous êtes sur la bonne voie.",
                    color: "text-sky-500"
                };
            } else if (score >= 14 && score < 16) {
                return {
                    message: "Bien",
                    emoji: "😊",
                    motivation: "Très bon effort, continuez à exceller !",
                    color: "text-blue-500"
                };
            } else if (score >= 16 && score < 18) {
                return {
                    message: "Très bien",
                    emoji: "😄",
                    motivation: "Excellent travail ! Vous avez fait un excellent travail.",
                    color: "text-purple-500"
                };
            } else {
                return {
                    message: "Excellent",
                    emoji: "🏆",
                    motivation: "Félicitations pour votre performance exceptionnelle !",
                    color: "text-green-500"
                };
            }
        } else {
            if (score >= passingScore) {
                return {
                    message: "Félicitations !",
                    emoji: "😊",
                    motivation: "Vous avez réussi l'examen avec succès.",
                    color: "text-sky-500"
                };
            } else {
                return {
                    message: "Bonne chance la prochaine fois !",
                    emoji: "😢",
                    motivation: "Ne vous découragez pas, vous pouvez le faire !",
                    color: "text-red-500"
                };
            }
        }
    };

    const { message, emoji, motivation, color } = getGradeMessage();

    const getBackgroundColor = (score, points) => {
        if (score === points) {
            return "bg-sky-500";
        } else if (score < points / 2) {
            return "bg-red-500";
        } else {
            return "bg-green-500";
        }
    };

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/';
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 backdrop-blur-lg">
            <div className="flex flex-col items-center bg-gray-200 p-8 rounded-xl shadow-lg text-center max-w-[35%] relative">
                <p className="mt-2">Votre note :</p>
                <div className={`${color}`}>
                    <h2 className="text-6xl font-bold mt-2">{score}/{totalPoints}</h2>
                    <div className="text-black text-xl mt-4">{emoji} {message}</div>
                    <p className="text-xl font-semibold">{motivation}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
                    {Object.entries(details).map(([type, [score, points]]) => (
                        <div
                            key={type}
                            className={`flex flex-col min-w-[30%] items-start ${getBackgroundColor(score, points)} rounded-2xl px-4 py-2 text-white`}
                        >
                            <span className="font-semibold">{type} :</span>
                            <p>Score: {score}</p>
                            <p>Points: {points}</p>
                        </div>
                    ))}
                </div>
                {!isFullLoading && (
                    <button
                        onClick={handleLogout}
                        className="w-12 h-12 mt-4 bg-red-500 rounded-xl flex items-center justify-center hover:opacity-80 transition duration-300"
                    >
                        <img src={Logout} alt="Logout" className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Grade;
