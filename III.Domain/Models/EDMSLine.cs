﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_LINE")]
    public class EDMSLine
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string QR_Code { get; set; }

        [StringLength(255)]
        public string L_Position { get; set; }

        [StringLength(255)]
        public string L_Size { get; set; }

        [StringLength(255)]
        public string L_Text { get; set; }

        public int CNT_Rack { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string FloorCode { get; set; }

        [StringLength(255)]
        public string L_Color { get; set; }

        [StringLength(255)]
        public string L_Status { get; set; }
    }
}
