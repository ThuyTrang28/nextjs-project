import http from "./HttpAxios";

const ClientMenuService = {
    /**
     * Lấy toàn bộ menu theo vị trí (mặc định là mainmenu)
     * @param {string} position - 'mainmenu' hoặc 'footermenu'
     */
    getByPosition: (position = 'mainmenu') => {
        return http.get("/menu", { 
            params: { position: position } 
        });
    },

    /**
     * Lấy menu Header (Shortcut)
     * Tương ứng với Route: /api/menu-header
     */
    getHeader: () => {
        return http.get("/menu-header");
    },

    /**
     * Lấy menu Footer (Shortcut)
     * Tương ứng với Route: /api/menu-footer
     */
    getFooter: () => {
        return http.get("/menu-footer");
    }
};

export default ClientMenuService;