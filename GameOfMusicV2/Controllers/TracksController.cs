﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using ApiService.Models;
using GameOfMusicV2.Models;
using Storage;

namespace GameOfMusicV2.Controllers
{
    [AllowCrossSiteJson]
    public class TracksController : ApiController
    {
        // GET api/tracks/5
        public async Task<TrackEntity> Get(string id)
        {
            var dc = new TableDataContext<TrackEntity>();
            var track = await dc.GetSingleEntityAsync(id);            
            track.ClientAddress = null;
            return track;
        }

        // POST api/tracks
        public async Task<string> Post(TrackEntity track)
        {
            track.ClientAddress = HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] ?? HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"];
            var dc = new TableDataContext<TrackEntity>();
            var result = await dc.InsertEntityAsync(track);
            if (result != null)
                return result.PartitionKey;

            return null;
        }
    }
}
