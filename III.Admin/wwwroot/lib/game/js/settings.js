var CANVAS_WIDTH = 1920;
var CANVAS_HEIGHT = 1080;

var EDGEBOARD_X = 256;
var EDGEBOARD_Y = 84;

var FPS_TIME      = 1000/24;
var DISABLE_SOUND_MOBILE = false;

var STATE_LOADING = 0;
var STATE_MENU    = 1;
var STATE_HELP    = 1;
var STATE_GAME    = 3;

var PRIMARY_FONT = "Arial";
var SECONDARY_FONT = "Arial Black";

var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_DRAG_START  = 4;
var ON_DRAG_END    = 5;

var TIME_ANIM_IDLE;
var ANIM_IDLE1_TIMESPEED;
var ANIM_IDLE2_TIMESPEED;
var ANIM_IDLE3_TIMESPEED;

var ANIM_SPIN_TIMESPEED;

var TIME_ANIM_WIN;
var ANIM_WIN1_TIMESPEED;
var ANIM_WIN2_TIMESPEED;

var TIME_ANIM_LOSE;

var STATE_IDLE = 0;
var STATE_SPIN = 1;
var STATE_WIN = 2;
var STATE_LOSE = 3;

var LED_SPIN = 3;

var MIN_FAKE_SPIN = 3;
var WHEEL_SPIN_TIMESPEED = 2600;

var START_CREDIT;
var START_BET;
var BET_OFFSET;
var MAX_BET;

var WHEEL_SETTINGS;

var AD_SHOW_COUNTER = new Array();

var BANK_CASH;
var WIN_OCCURRENCE;


var SEGMENT_ROT = 360 /20;