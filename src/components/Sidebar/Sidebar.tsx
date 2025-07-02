import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Drawer, 
  Divider, 
  Box, 
  Button, 
  IconButton,
  styled,
} from '@mui/material';
import type { Theme, CSSObject } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { hasPermission, logout, getUserPermissions } from '../../utils/auth';
import { useSidebar } from '../../contexts/SidebarContext';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

const menuItems: MenuItem[] = [
  {
    text: 'Home',
    icon: <HomeIcon />,
    path: '/',
  },
  {
    text: 'Minhas Dietas',
    icon: <RestaurantMenuIcon />,
    path: '/diets',
    permission: 'list_diet',
  },
  {
    text: 'Criar Dieta',
    icon: <AddCircleOutlineIcon />,
    path: '/dietas/novo',
    permission: 'create_diet',
  },
];

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // Filtra os itens do menu baseado nas permissões do usuário
  const filteredMenuItems = React.useMemo(() => {
    console.log('Filtrando itens do menu com permissões:', getUserPermissions());
    return menuItems.filter((item) => {
      // Se não requer permissão, mostra o item
      if (!item.permission) return true;
      
      // Verifica se o usuário tem a permissão necessária
      const hasAccess = hasPermission(item.permission);
      console.log(`Item ${item.text} (${item.permission}): ${hasAccess ? 'PERMITIDO' : 'NEGADO'}`);
      
      return hasAccess;
    });
  }, []); // Executa apenas uma vez na montagem do componente

  const handleDrawerToggle = () => {
    toggleSidebar();
  };

  return (
    <Box>
      <StyledDrawer
        variant="permanent"
        open={isSidebarOpen}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ overflow: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <List sx={{ flexGrow: 1 }}>
          {filteredMenuItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding 
              sx={{ 
                display: 'block',
                px: 1,
                py: 0.5,
              }}
            >
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                className="menu-item"
                sx={{
                  minHeight: 48,
                  justifyContent: isSidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                      opacity: 0.9,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isSidebarOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.9rem',
                  }}
                  sx={{ 
                    opacity: isSidebarOpen ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
          </List>
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                pl: isSidebarOpen ? 3 : 2,
                pr: isSidebarOpen ? 3 : 2,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.9rem',
                borderColor: 'rgba(211, 47, 47, 0.5)',
                color: 'error.main',
                fontWeight: 500,
                borderRadius: 2,
                minWidth: 0,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  borderColor: 'error.main',
                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
                  transform: 'translateY(-1px)',
                },
                '& .MuiButton-startIcon': {
                  marginRight: isSidebarOpen ? 1 : 0,
                  marginLeft: isSidebarOpen ? 0 : '-4px',
                },
              }}
            >
              {isSidebarOpen ? 'Sair' : ''}
            </Button>
          </Box>
        </Box>
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
