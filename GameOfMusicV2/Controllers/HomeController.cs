using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using GameOfMusicV2.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Storage;

namespace GameOfMusicV2.Controllers
{
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index(string id = null)
        {
            if (id != null)
            {
                var dc = new TableDataContext<TrackEntity>();
                var track = await dc.GetSingleEntityAsync(id);
                if (track != null)
                {
                    track.ClientAddress = null;
                    string json = JsonConvert.SerializeObject(track, Formatting.Indented, 
                        new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
                    ViewBag.Track = json;
                }
            }
            return View();
        }

    }
}