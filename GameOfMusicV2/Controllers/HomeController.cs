using System.Threading.Tasks;
using System.Web.Mvc;

namespace GameOfMusicV2.Controllers
{
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index(string id = null)
        {
            
            return View();
        }

    }
}