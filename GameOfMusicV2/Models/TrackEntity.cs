using System;
using System.Collections.Generic;
using System.Drawing;
using CSharpVitamins;
using Storage;

namespace GameOfMusicV2.Models
{
    [CollectionName("Tracks")]
    public class TrackEntity : BaseEntity
    {
        public string Bpm { get; set; }
        public string Sound { get; set; }
        public string Cells { get; set; }
        public string Chords { get; set; }

        public string ClientAddress { get; set; }

        public TrackEntity()
        {
            PartitionKey = ShortGuid.NewGuid().ToString();
            RowKey = "";
        }
    }
    public class Chord
    {
        public string Key { get; set; }
        public string Mod { get; set; }
    }

    public class Cell
    {
        public int X { get; set; }
        public int Y { get; set; }
    }
}