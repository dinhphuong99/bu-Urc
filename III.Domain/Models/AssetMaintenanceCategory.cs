﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_MAINTENANCE_CATEGORY")]
    public class AssetMaintenanceCategory
	{
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryID { get; set; }

		[StringLength(maximumLength: 100)]
		public string CategoryCode { get; set; }

		[StringLength(maximumLength: 255)]
		public string CategoryName { get; set; }

		public int Quantity { get; set; }

		public long Price { get; set; }

		public long TotalMoneyCategory { get; set; }

		[StringLength(maximumLength: 255)]
		public string StatusCategory { get; set; }		

		[StringLength(maximumLength: 500)]
		public string NoteCategory { get; set; }

		[StringLength(maximumLength: 50)]
		public string AssetCodeCategory { get; set; }

		[StringLength(maximumLength: 255)]
		public string UserCategory { get; set; }

		[StringLength(maximumLength: 100)]
		public string TicketCodeCategory { get; set; }

		[StringLength(maximumLength: 100)]
		public string CreatedBy { get; set; }

		public DateTime? CreatedTime { get; set; }

		[StringLength(maximumLength: 100)]
		public string UpdatedBy { get; set; }

		public DateTime? UpdatedTime { get; set; }

		[StringLength(maximumLength: 100)]
		public string DeletedBy { get; set; }

		public DateTime? DeletedTime { get; set; }

		public bool IsDeleted { get; set; }

        [StringLength(maximumLength: 50)]
        public string Currency { get; set; }

    }
}
