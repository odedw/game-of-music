using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public class StorageConfiguration
    {
        public static string ProjectName { get; set; }
        public static string StorageConnectionString { get; set; }
        static StorageConfiguration()
        {
            StorageConnectionString = ConfigurationManager.AppSettings["StorageConnectionString"];
            if (StorageConnectionString == null)
                throw new Exception("StorageConnectionString is not configured");
            ProjectName = ConfigurationManager.AppSettings["ProjectName"];
            if (ProjectName == null)
                throw new Exception("ProjectName is not configured");
        }
    }
}
