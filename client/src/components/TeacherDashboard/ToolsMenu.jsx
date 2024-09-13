import React from 'react';
import Edit from '../../assets/Edit.svg';
import EditSquare from '../../assets/EditSquare.svg';

const ToolsMenu = ({ onAddPhase, onAddQCM, onAddCLD, onAddCLT, onAddRPF, onAddRLV, onAddRLE, onAddOLE, canAddQCM }) => {
  return (
    <div className="flex flex-col p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <img src={Edit} alt="Edit" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddPhase} className="text-sky-500">
          Ajouter une partie
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Edit Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddQCM} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un QCM
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Draw Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddCLD} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un CLD
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Table Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddCLT} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un CLT
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Table Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddRPF} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un RPF
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Table Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddRLV} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un RLV
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Table Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddRLE} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un RLE
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <img src={EditSquare} alt="Table Square" className="w-8 h-8 p-2 bg-sky-500 rounded-xl" />
        <button onClick={onAddOLE} className="text-sky-500" disabled={!canAddQCM}>
          Ajouter un OLE
        </button>
      </div>
    </div>
  );
};

export default ToolsMenu;
