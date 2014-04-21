using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class CollectionNameAttribute : Attribute
    {
        /// <summary>
        /// Initializes a new instance of the CollectionName class attribute with the desired name.
        /// </summary>
        /// <param name="value">Name of the collection.</param>
        public CollectionNameAttribute(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Empty collectionname not allowed", "value");
            }

            this.Name = value;
        }

        /// <summary>
        /// Gets the name of the collection.
        /// </summary>
        /// <value>The name of the collection.</value>
        public string Name { get; private set; }
    }
}
