using System;
using System.Collections.Generic;
using System.Drawing;
using Storage;

namespace GameOfMusicV2.Models
{
    [CollectionName("Tracks")]
    public class TrackEntity : BaseEntity
    {
        public string Bpm { get; set; }
        public string Sound { get; set; }
        public List<Point> Cells { get; set; }
        public List<Chord> Chords { get; set; }

        public string ClientAddress { get; set; }

        public TrackEntity()
        {
            PartitionKey = Guid.NewGuid().ToString();
            RowKey = "";
        }
    }
    public class Chord
    {
        public string Key { get; set; }
        public string Mode { get; set; }
    }
}