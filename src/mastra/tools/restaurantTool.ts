import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}

interface HotPepperResponse {
  results: {
    shop: {
      id: string;
      name: string;
      name_kana: string;
      address: string;
      station_name: string;
      ktai_coupon: string;
      large_service_area: {
        code: string;
        name: string;
      };
      service_area: {
        code: string;
        name: string;
      };
      large_area: {
        code: string;
        name: string;
      };
      middle_area: {
        code: string;
        name: string;
      };
      small_area: {
        code: string;
        name: string;
      };
      lat: number;
      lng: number;
      genre: {
        code: string;
        name: string;
      };
      sub_genre: {
        code: string;
        name: string;
      };
      budget: {
        code: string;
        name: string;
      };
      budget_memo: string;
      catch: string;
      capacity: string;
      access: string;
      mobile_access: string;
      urls: {
        pc: string;
        sp?: string;
      };
      photo: {
        pc: {
          l: string;
          m: string;
          s: string;
        };
        mobile?: {
          l: string;
          s: string;
        };
      };
      open: string;
      close: string;
      party_capacity: string;
      wifi: string;
      wedding: string;
      course: string;
      free_drink: string;
      free_food: string;
      private_room: string;
      horigotatsu: string;
      tatami: string;
      card: string;
      non_smoking: string;
      charter: string;
      ktai: string;
      parking: string;
      barrier_free: string;
      sommelier: string;
      open_air: string;
      show: string;
      equipment: string;
      karaoke: string;
      band: string;
      tv: string;
      english: string;
      pet: string;
      child: string;
      lunch: string;
      midnight: string;
      midnight_meal: string;
      shop_detail_memo: string;
      coupon_urls?: {
        pc: string;
        sp: string;
      };
      special?: {
        code: string;
        name: string;
        special_category: {
          code: string;
          name: string;
        };
        title: string;
      }[];
      credit_card?: {
        code: string;
        name: string;
      }[];
    }[];
  };
}

export const restaurantTool = createTool({
  id: "search-restaurants",
  description:
    "Search for restaurants in a specific location with optional filters",
  inputSchema: z.object({
    location: z.string().describe("Location name"),
    genre: z.string().optional().describe("Restaurant genre/cuisine type"),
    budget: z.string().optional().describe("Budget range"),
    keyword: z.string().optional().describe("Keyword for free text search"),
    range: z
      .number()
      .optional()
      .describe(
        "Search range (1: 300m, 2: 500m, 3: 1000m, 4: 2000m, 5: 3000m)"
      ),
    count: z
      .number()
      .optional()
      .describe("Number of results to return (max 100)"),
    wifi: z.boolean().optional().describe("Filter for restaurants with WiFi"),
    private_room: z
      .boolean()
      .optional()
      .describe("Filter for restaurants with private rooms"),
    card: z
      .boolean()
      .optional()
      .describe("Filter for restaurants that accept credit cards"),
    non_smoking: z
      .boolean()
      .optional()
      .describe("Filter for restaurants with non-smoking areas"),
    lunch: z
      .boolean()
      .optional()
      .describe("Filter for restaurants that serve lunch"),
    english: z
      .boolean()
      .optional()
      .describe("Filter for restaurants with English menus"),
    child: z
      .boolean()
      .optional()
      .describe("Filter for child-friendly restaurants"),
  }),
  outputSchema: z.object({
    restaurants: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        name_kana: z.string().optional(),
        address: z.string(),
        station_name: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        genre: z.string().optional(),
        catch: z.string().optional(),
        budget: z.string().optional(),
        budget_memo: z.string().optional(),
        capacity: z.string().optional(),
        access: z.string().optional(),
        mobile_access: z.string().optional(),
        urls: z
          .object({
            pc: z.string().optional(),
            sp: z.string().optional(),
          })
          .optional(),
        photo: z
          .object({
            pc: z
              .object({
                l: z.string().optional(),
                m: z.string().optional(),
                s: z.string().optional(),
              })
              .optional(),
          })
          .optional(),
        open: z.string().optional(),
        close: z.string().optional(),
        wifi: z.string().optional(),
        card: z.string().optional(),
        non_smoking: z.string().optional(),
        parking: z.string().optional(),
        barrier_free: z.string().optional(),
        english: z.string().optional(),
        child: z.string().optional(),
        lunch: z.string().optional(),
        midnight: z.string().optional(),
        free_drink: z.string().optional(),
        free_food: z.string().optional(),
        private_room: z.string().optional(),
        horigotatsu: z.string().optional(),
        tatami: z.string().optional(),
        course: z.string().optional(),
        party_capacity: z.string().optional(),
      })
    ),
    location: z.string(),
    total_results: z.number().optional(),
  }),
  execute: async ({ context }) => {
    return await searchRestaurants(context.location);
  },
});

const searchRestaurants = async (
  location: string,
  options: {
    genre?: string;
    budget?: string;
    keyword?: string;
    range?: number;
    count?: number;
    wifi?: boolean;
    private_room?: boolean;
    card?: boolean;
    non_smoking?: boolean;
    lunch?: boolean;
    english?: boolean;
    child?: boolean;
  } = {}
) => {
  // 1. 地名から緯度・経度を取得
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  // 2. HotPepper APIを使用してレストラン情報を取得
  // 注意: 実際の実装では環境変数からAPIキーを取得する必要があります
  const apiKey = process.env.HOT_PEPPER_API_KEY;
  if (!apiKey) {
    throw new Error("HOT_PEPPER_API_KEY is not defined");
  }

  // クエリパラメータの構築
  const params = new URLSearchParams();
  params.append("key", apiKey);
  params.append("lat", latitude.toString());
  params.append("lng", longitude.toString());
  params.append("range", options.range?.toString() || "5");
  params.append("order", "4"); // おススメ順
  params.append("format", "json");
  params.append("count", options.count?.toString() || "10");

  // オプションパラメータの追加
  if (options.genre) params.append("genre", options.genre);
  if (options.budget) params.append("budget", options.budget);
  if (options.keyword) params.append("keyword", options.keyword);
  if (options.wifi) params.append("wifi", "1");
  if (options.private_room) params.append("private_room", "1");
  if (options.card) params.append("card", "1");
  if (options.non_smoking) params.append("non_smoking", "1");
  if (options.lunch) params.append("lunch", "1");
  if (options.english) params.append("english", "1");
  if (options.child) params.append("child", "1");

  const hotPepperUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${params.toString()}`;

  try {
    const response = await fetch(hotPepperUrl);
    const data = (await response.json()) as HotPepperResponse;

    if (!data.results || !data.results.shop) {
      return {
        restaurants: [],
        location: name,
        total_results: 0,
      };
    }

    // レストラン情報を整形
    const restaurants = data.results.shop.map((shop) => ({
      id: shop.id,
      name: shop.name,
      name_kana: shop.name_kana,
      address: shop.address,
      station_name: shop.station_name,
      lat: shop.lat,
      lng: shop.lng,
      genre: shop.genre?.name,
      catch: shop.catch,
      budget: shop.budget?.name,
      budget_memo: shop.budget_memo,
      capacity: shop.capacity,
      access: shop.access,
      mobile_access: shop.mobile_access,
      urls: {
        pc: shop.urls?.pc,
        sp: shop.urls?.sp,
      },
      photo: {
        pc: {
          l: shop.photo?.pc?.l,
          m: shop.photo?.pc?.m,
          s: shop.photo?.pc?.s,
        },
      },
      open: shop.open,
      close: shop.close,
      wifi: shop.wifi,
      card: shop.card,
      non_smoking: shop.non_smoking,
      parking: shop.parking,
      barrier_free: shop.barrier_free,
      english: shop.english,
      child: shop.child,
      lunch: shop.lunch,
      midnight: shop.midnight,
      free_drink: shop.free_drink,
      free_food: shop.free_food,
      private_room: shop.private_room,
      horigotatsu: shop.horigotatsu,
      tatami: shop.tatami,
      course: shop.course,
      party_capacity: shop.party_capacity,
    }));

    return {
      restaurants,
      location: name,
      total_results: data.results.shop.length,
    };
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    throw new Error(`Failed to fetch restaurant data: ${error}`);
  }
};

export const restaurantDetailTool = createTool({
  id: "get-restaurant-detail",
  description: "Get detailed information for a specific restaurant",
  inputSchema: z.object({
    placeId: z.string().describe("HotPepper shop ID"),
  }),
  outputSchema: z.object({
    shop: z.object({
      id: z.string(),
      name: z.string(),
      name_kana: z.string().optional(),
      address: z.string(),
      station_name: z.string().optional(),
      catch: z.string().optional(),
      genre: z.string().optional(),
      budget: z.string().optional(),
      budget_memo: z.string().optional(),
      capacity: z.string().optional(),
      access: z.string().optional(),
      urls: z.string().optional(),
      photo: z.string().optional(),
      open: z.string().optional(),
      close: z.string().optional(),
      wifi: z.string().optional(),
      card: z.string().optional(),
      non_smoking: z.string().optional(),
      parking: z.string().optional(),
      barrier_free: z.string().optional(),
      english: z.string().optional(),
      child: z.string().optional(),
      lunch: z.string().optional(),
      midnight: z.string().optional(),
      free_drink: z.string().optional(),
      free_food: z.string().optional(),
      private_room: z.string().optional(),
      horigotatsu: z.string().optional(),
      tatami: z.string().optional(),
      course: z.string().optional(),
      party_capacity: z.string().optional(),
      other_memo: z.string().optional(),
    }),
  }),
  execute: async ({ context }) => {
    return await getRestaurantDetail(context.placeId);
  },
});

const getRestaurantDetail = async (placeId: string) => {
  // 注意: 実際の実装では環境変数からAPIキーを取得する必要があります
  const apiKey = process.env.HOT_PEPPER_API_KEY;
  if (!apiKey) {
    throw new Error("HOT_PEPPER_API_KEY is not defined");
  }

  const detailUrl = `http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&id=${placeId}&format=json`;

  try {
    const response = await fetch(detailUrl);
    const data = (await response.json()) as HotPepperResponse;

    if (!data.results || !data.results.shop || data.results.shop.length === 0) {
      throw new Error(`Restaurant with ID '${placeId}' not found`);
    }

    const shop = data.results.shop[0];

    return {
      shop: {
        id: shop.id,
        name: shop.name,
        name_kana: shop.name_kana,
        address: shop.address,
        station_name: shop.station_name,
        catch: shop.catch,
        genre: shop.genre?.name,
        budget: shop.budget?.name,
        budget_memo: shop.budget_memo,
        capacity: shop.capacity,
        access: shop.access,
        urls: shop.urls?.pc,
        photo: shop.photo?.pc?.l,
        open: shop.open,
        close: shop.close,
        wifi: shop.wifi,
        card: shop.card,
        non_smoking: shop.non_smoking,
        parking: shop.parking,
        barrier_free: shop.barrier_free,
        english: shop.english,
        child: shop.child,
        lunch: shop.lunch,
        midnight: shop.midnight,
        free_drink: shop.free_drink,
        free_food: shop.free_food,
        private_room: shop.private_room,
        horigotatsu: shop.horigotatsu,
        tatami: shop.tatami,
        course: shop.course,
        party_capacity: shop.party_capacity,
        other_memo: shop.shop_detail_memo,
      },
    };
  } catch (error) {
    console.error("Error fetching restaurant detail:", error);
    throw new Error(`Failed to fetch restaurant detail: ${error}`);
  }
};
