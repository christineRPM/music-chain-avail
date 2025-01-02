// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MusicSequence {
    struct Player {
        string name;
        bool isActive;
        uint256[] currentSequence;
        uint256 sequencePosition;
    }
    
    struct MusicPiece {
        string creator;
        uint256[] notes;
        uint256[] timings;
        string title;
        uint256 timestamp;
    }
    
    mapping(string => Player) public players;
    mapping(uint256 => uint256[]) public levelSequences;
    MusicPiece[] public musicPieces;
    
    event PlayerRegistered(string playerId, string name);
    event SequenceStarted(string playerId, uint256 level);
    event LevelCompleted(string playerId, uint256 level);
    event MusicPieceCreated(uint256 indexed id, string creator, string title);
    
    function registerPlayer(string memory name, string memory playerId) public {
        require(!players[playerId].isActive, "Player already exists");
        players[playerId].name = name;
        players[playerId].isActive = true;
        emit PlayerRegistered(playerId, name);
    }
    
    function createMusicPiece(
        string memory _creator, 
        uint256[] memory _notes, 
        uint256[] memory _timings, 
        string memory _title
    ) public returns (uint256) {
        require(_notes.length > 0, "Sequence cannot be empty");
        require(_notes.length == _timings.length, "Notes and timings must have same length");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        MusicPiece memory newPiece = MusicPiece({
            creator: _creator,
            notes: _notes,
            timings: _timings,
            title: _title,
            timestamp: block.timestamp
        });
        
        musicPieces.push(newPiece);
        uint256 newPieceId = musicPieces.length - 1;
        
        emit MusicPieceCreated(newPieceId, _creator, _title);
        return newPieceId;
    }
    
    function getMusicPiece(uint256 _id) public view returns (
        string memory creator, 
        uint256[] memory notes, 
        uint256[] memory timings,
        string memory title, 
        uint256 timestamp
    ) {
        require(_id < musicPieces.length, "Music piece does not exist");
        MusicPiece memory piece = musicPieces[_id];
        return (piece.creator, piece.notes, piece.timings, piece.title, piece.timestamp);
    }
    
    function getMusicPiecesCount() public view returns (uint256) {
        return musicPieces.length;
    }
    
    function getAllMusicPieces() public view returns (MusicPiece[] memory) {
        return musicPieces;
    }
}