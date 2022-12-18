using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace ESEIM.Models
{
    public class Vehicle
    {
        [XmlElement]
        public string VehiclePlate { get; set; }
        [XmlElement]
        public string UTCTime { get; set; }
        [XmlElement]
        public string LocalTime { get; set; }
        [XmlElement]
        public string Latitude { get; set; }
        [XmlElement]
        public string Longitude { get; set; }
        [XmlElement]
        public string Speed { get; set; }
        [XmlElement]
        public string State { get; set; }
        [XmlElement]
        public string Direction { get; set; }
        [XmlElement]
        public string Address { get; set; }
        [XmlElement]
        public string TotalKm { get; set; }
        [XmlElement]
        public string Temperature { get; set; }
    }

    [XmlRoot("BAVehicle", Namespace = "http://gps4.binhanh.com.vn/")]
    public class BAVehicle
    {
        [XmlElement("MessageResult")]
        public string MessageResult { get; set; }

        [XmlArray("Vehicles")]
        [XmlArrayItem("Vehicle")]
        public List<Vehicle> Vehicle { get; set; }
    }
}
