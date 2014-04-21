using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;

namespace Storage
{
    public class TableDataContext<T> where T : BaseEntity
    {
        private static HashSet<string> sCreatedTables = new HashSet<string>();  
        private async Task<CloudTable> GetCloudTableAsync()
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(StorageConfiguration.StorageConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            var tableName = GetTableName();
            CloudTable table = tableClient.GetTableReference(tableName);
            if (!sCreatedTables.Contains(tableName))
            {
                await table.CreateIfNotExistsAsync();
                sCreatedTables.Add(tableName);
            }

            return table;
        }        

        private string GetTableName()
        {
            var collectionNameAttr = (CollectionNameAttribute) Attribute.GetCustomAttribute(typeof (T), typeof (CollectionNameAttribute));
            return string.Format("{0}1{1}", StorageConfiguration.ProjectName, collectionNameAttr.Name);
        }      

        public async Task<T> GetSingleEntityAsync(string partitionKey, string rowKey = "")
        {
            var table = await GetCloudTableAsync();
            // Create a retrieve operation that takes a customer entity.
            TableOperation retrieveOperation = TableOperation.Retrieve<T>(partitionKey, rowKey);

            // Execute the retrieve operation.
            TableResult retrievedResult = await table.ExecuteAsync(retrieveOperation);

            return retrievedResult.Result as T;
        }

        public async Task<T> InsertEntityAsync(T entity)
        {
            var table = await GetCloudTableAsync();

            // Create the TableOperation that inserts the customer entity.
            TableOperation insertOperation = TableOperation.Insert(entity);

            // Execute the insert operation.
            try
            {
                var result = await table.ExecuteAsync(insertOperation);
                return result.Result as T;
            }
            catch (Exception)
            {
                return null;
            }

        }
    }
}
