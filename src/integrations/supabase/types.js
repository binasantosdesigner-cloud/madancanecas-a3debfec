export const Constants = {
    public: {
        Enums: {
            app_role: ["admin", "customer"],
            art_status: [
                "waiting",
                "adjustment_requested",
                "new_version",
                "approved",
                "expired",
                "cancelled",
            ],
            order_status: [
                "pending",
                "in_production",
                "shipped",
                "completed",
                "cancelled",
            ],
            product_kind: ["ready", "custom"],
        },
    },
};
