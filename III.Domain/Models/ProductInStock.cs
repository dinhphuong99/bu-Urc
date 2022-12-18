using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PRODUCT_IN_STOCK")]
    public class ProductInStock
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string LotProductCode { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(100)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(50)]
        public string StoreCode { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
