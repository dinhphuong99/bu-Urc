using ESEIM;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    //Modal address
    public class Point
    {
        public float? X { get; set; }
        public float? Y { get; set; }
    }
    public class GoogleGeoCodeResponse
    {

        public string status { get; set; }
        public results[] results { get; set; }

    }
    public class results
    {
        public string formatted_address { get; set; }
        public geometry geometry { get; set; }
        public string[] types { get; set; }
        public address_component[] address_components { get; set; }
    }
    public class geometry
    {
        public string location_type { get; set; }
        public location location { get; set; }
    }
    public class location
    {
        public string lat { get; set; }
        public string lng { get; set; }
    }
    public class address_component
    {
        public string long_name { get; set; }
        public string short_name { get; set; }
        public string[] types { get; set; }
    }


    //Model polygon gps
    public class GisObject
    {
        public GisObject()
        {
            type = "";
            properties = new GisPropertise();
            geometry = new Geometry();
        }
        public string type { get; set; }
        public GisPropertise properties { get; set; }
        public Geometry geometry { get; set; }
    }
    public class GisPropertise
    {

        public int ID_0 { get; set; }
        public string ISO { get; set; }
        public string NAME_0 { get; set; }
        public int ID_1 { get; set; }
        public string NAME_1 { get; set; }
        public int ID_2 { get; set; }
        public string NAME_2 { get; set; }
        public string HASC_2 { get; set; }
        public int CCN_2 { get; set; }
        public string TYPE_2 { get; set; }
        public string ENGTYPE_2 { get; set; }
        public string VARNAME_2 { get; set; }
    }
    public class Geometry
    {
        public Geometry()
        {
            type = "";
            coordinates = new List<List<List<double>>>();
            coordinates.Add(new List<List<double>>());
        }
        public string type { get; set; }
        public List<List<List<double>>> coordinates { get; set; }
    }
    public class Map
    {
        public MapProperties properties { get; set; }
        public List<List<List<double>>> gis_data { get; set; }
    }
    public class MapProperties
    {
        public string fill_color { get; set; }
        public string text { get; set; }
        public string font_size { get; set; }

    }

    public class AddressOpenstreetmap
    {
        public string place_id { get; set; }
        public string licence { get; set; }
        public string osm_type { get; set; }
        public string osm_id { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string display_name { get; set; }
        public AddressObjOpenstreetMap address { get; set; }
    }
    public class AddressObjOpenstreetMap
    {
        public string city { get; set; }
        public string country { get; set; }
        public string country_code { get; set; }
        public string county { get; set; }
        public string postcode { get; set; }
        public string road { get; set; }
        public string suburb { get; set; }
    }
    public interface IGoogleAPIService
    {
        Task<GoogleGeoCodeResponse> GetAddress(string latitude, string longitude);
        double[] WGS84toGoogleBing(double lon, double lat);
        double[] GoogleBingtoWGS84Mercator(double x, double y);

        bool IsInPolygon(string point, string polygon);
        string ConvertLatLnToMap(string googleMap);
        Task<string> GetAddressForCoordinates(double latitude, double longitude);
    }

    public class GoogleAPIService : IGoogleAPIService
    {
        private readonly AppSettings _appSettings;
        public GoogleAPIService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }
        public async Task<GoogleGeoCodeResponse> GetAddress(string latitude, string longitude)
        {
            GoogleGeoCodeResponse result = new GoogleGeoCodeResponse();
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(_appSettings.UrlBase);
                    var content = new FormUrlEncodedContent(new[]
                    {
                        new KeyValuePair<string, string>("latitude", latitude),
                        new KeyValuePair<string, string>("longitude", longitude)
                    });
                    var result1 = await client.PostAsync("MobileLogin/GetAddress", content);
                    string resultContent = await result1.Content.ReadAsStringAsync();
                    result = JsonConvert.DeserializeObject<GoogleGeoCodeResponse>(resultContent);
                }
            }
            catch (Exception ex)
            {
                var k = 0;
            }
            return result;
        }

        //Conversion: EPSG:4326 TO EPSG:3857
        public double[] WGS84toGoogleBing(double lon, double lat)
        {
            double x = lon * 20037508.34 / 180;
            double y = Math.Log(Math.Tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            y = y * 20037508.34 / 180;
            return new double[] { x, y };
        }

        //Conversion: EPSG:3857 TO EPSG:4326
        public double[] GoogleBingtoWGS84Mercator(double x, double y)
        {
            double lon = (x / 20037508.34) * 180;
            double lat = (y / 20037508.34) * 180;

            lat = 180 / Math.PI * (2 * Math.Atan(Math.Exp(lat * Math.PI / 180)) - Math.PI / 2);
            return new double[] { lon, lat };
        }

        public bool IsInPolygon(string point, string polygon)
        {
            try
            {
                //point = "[105.8096319437027,20.990909563014448]";
                //polygon = "[[[105.80894261598587,20.991352807581404],[105.8089479804039,20.991262656250637],[105.80914109945296,20.991320252940465],[105.80894261598587,20.991352807581404]]]";

                var point1 = JsonConvert.DeserializeObject<List<string>>(point);
                var _polygon = new List<Point>();

                var polygons = JsonConvert.DeserializeObject<List<List<List<string>>>>(polygon);
                if (polygons.Count > 0)
                {
                    foreach (var item in polygons.FirstOrDefault())
                    {
                        var p = new Point
                        {
                            X = float.Parse(item[0]),
                            Y = float.Parse(item[1])
                        };

                        _polygon.Add(p);
                    }
                }

                var _point = new Point
                {
                    X = float.Parse(point1[0]),
                    Y = float.Parse(point1[1])
                };

                var coef = _polygon.Skip(1).Select((p, i) =>
                                                (_point.Y - _polygon[i].Y) * (p.X - _polygon[i].X)
                                              - (_point.X - _polygon[i].X) * (p.Y - _polygon[i].Y))
                                        .ToList();

                if (coef.Any(p => p == 0))
                    return true;

                for (int i = 1; i < coef.Count(); i++)
                {
                    if (coef[i] * coef[i - 1] < 0)
                        return false;
                }
                return true;
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public string ConvertLatLnToMap(string googleMap)
        {
            var gps = googleMap.Split(",");
            Map map = new Map();
            GisObject gisObject = new GisObject();
            for (var item = 0; item < 3; ++item)
            {
                List<double> m = new List<double>();
                m.Add((Double.Parse(gps[1].Trim())) * 20037508.34 / 180);
                m.Add((Math.Log(Math.Tan((90 + (Double.Parse(gps[0].Trim()))) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                gisObject.geometry.coordinates[0].Add(m);
            }

            map.gis_data = gisObject.geometry.coordinates;
            map.properties = new MapProperties
            {
                fill_color = "#64c936",
                font_size = "12"
            };
            return JsonConvert.SerializeObject(map);
        }

        public async Task<string> GetAddressForCoordinates(double latitude, double longitude)
        {
            AddressOpenstreetmap result = new AddressOpenstreetmap();
            var address = "";
            try
            {
                
                HttpClient httpClient = new HttpClient { BaseAddress = new Uri("https://nominatim.openstreetmap.org/") };
                httpClient.DefaultRequestHeaders.Add("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)");
                httpClient.DefaultRequestHeaders.Add("Referer", "http://www.microsoft.com");
                HttpResponseMessage httpResult = await httpClient.GetAsync(
                    String.Format("reverse?format=json&lat={0}&lon={1}", latitude, longitude));
                result = JsonConvert.DeserializeObject<AddressOpenstreetmap>(await httpResult.Content.ReadAsStringAsync());
                address = result.address.suburb + ", " + result.address.county + ", " + result.address.city + ", " + result.address.country;
            }
            catch (Exception ex)
            {
                
            }
            return address;
        }
    }
}
