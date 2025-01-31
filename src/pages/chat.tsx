import { ChatOverview } from '@/components/chat/chatOverview'
import { SafeList } from '@/components/chat/SafeList'
import FormattedName from '@/components/common/FormattedName/FormattedName'
import Identicon from '@/components/common/Identicon'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import SettingsIcon from '@/public/images/chat/settings-svgrepo-com.svg'
import ViewSidebarIcon from '@/public/images/chat/sidebar-right-svgrepo-com.svg'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { ArrowBackIos } from '@mui/icons-material'
import { useAppDispatch } from '@/store'
import Dropdown from '@/components/common/DropDown'
import {
  Box, Container,
  Drawer,
  IconButton, Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { openModal } from '@/store/modalServiceSlice'
import { modalTypes } from '@/components/chat/modals'
import { useTxFilter } from '@/utils/tx-history-filter'
import TxFilterForm from '@/components/transactions/TxFilterForm'

const ChatWrapper = dynamic(() => import('@/components/chat/ChatWrapper'), { ssr: false })

const drawerWidth = 360

const Main = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}))

const Chat = () => {
  //media queries
  const matches = useMediaQuery('(max-width: 900px)')
  const matchesDesktop = useMediaQuery('(min-width: 901px)')
  //routing
  const router = useRouter()
  //user and safe
  const wallet = useWallet()
  const { safe, safeAddress, safeLoading } = useSafeInfo()
  const owners = safe?.owners || ['']
  const ownerArray = owners.map((owner) => owner.value)
  //modals and modal control
  const [createSafe] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>((safeAddress && !safeLoading) ? true : false)
  const dispatch = useAppDispatch()
  //dropdown
  const [selectedValue, setSelectedValue] = useState<string>('chat')
  //tx filters
  const [showFilter, setShowFilter] = useState(false)
  const [filter] = useTxFilter()

  const toggleFilter = () => {
    setShowFilter((prev) => !prev)
  }

  useEffect(() => {
    if (router.asPath.includes('chain')) {
      dispatch(openModal({ modalName: modalTypes.createSafe, modalProps: '' }))
    }
    if (router.asPath.includes('app')) {
      dispatch(openModal({ modalName: modalTypes.appModal, modalProps: '' }))
    }
  }, [router.asPath])

  useEffect(() => {
    if (!wallet?.address || (!safeAddress && !safeLoading)) setOpen(false)
    else setOpen(true)
  }, [wallet?.address, safeAddress])

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }

    setOpen(open)
  }

  const handleCreateSafe = () => {
    dispatch(openModal({ modalName: modalTypes.createSafe, modalProps: '' }))
  }

  const handleSetDisplay = (displayType: string) => {
    setSelectedValue(displayType)
  }

  return (
    <>
      <Head>
        <title>Decentra &mdash; Chat</title>
      </Head>
      {showFilter && (
        //@to-do: DANIEL pls help make this look good on mobile and all
        <Box sx={{ position: 'absolute', top: '20vh', zIndex: '100', left: '20vw', width: '30vw' }}>
          <TxFilterForm modal={true} toggleFilter={toggleFilter} />
        </Box>
      )}
      <Box sx={{ display: 'flex' }}>
        {matchesDesktop &&
          <Drawer
            sx={{
              width: 287,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 287,
                bgcolor: 'var(--color-background-lightcolor)',
                boxSizing: 'border-box',
                height: 'calc(100vh - var(--header-height))',
                top: 'var(--header-height)',
                borderRadius: '0',
                borderRight: '1px solid var(--color-border-light)',
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <SafeList createSafe={createSafe} setCreateSafe={handleCreateSafe} />
          </Drawer>
        }
        <Main open={open} sx={{ flexGrow: 1, bgcolor: 'var(--color-background-lightcolor)' }}>
          <Box display="flex">
            <Box flexGrow={1}>
              {wallet?.address && (safeAddress && !safeLoading) &&
                <Toolbar
                  sx={{
                    display: 'flex',
                    position: 'sticky',
                    zIndex: 1,
                    top: 'var(--header-height)',
                    px: 3,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'var(--color-background-lightcolor)',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '14px' }}>
                    {matches &&
                      <Link href={{ pathname: AppRoutes.safeList }}>
                        <IconButton aria-label="back">
                          <ArrowBackIos />
                        </IconButton>
                      </Link>
                    }
                    {(safeAddress && !safeLoading) && <>
                      <Identicon address={safeAddress} radius={6} size={32} />
                      <FormattedName address={safeAddress} weight={600} />
                    </>
                    }
                  </Box>
                  <Box>
                    <IconButton sx={{ width: '150px' }}>
                      <Dropdown onChange={handleSetDisplay} display={selectedValue} />
                    </IconButton>
                    {
                      selectedValue === 'history' && <IconButton onClick={toggleFilter} aria-label="filter">
                        <FilterAltOutlinedIcon />
                      </IconButton>  
                    }
                    <IconButton
                      sx={{ marginRight: '4px' }}
                      color="inherit" aria-label="settings"
                      onClick={() => dispatch(openModal({ modalName: modalTypes.settingsModal, modalProps: '' }))}>
                      <SettingsIcon />
                    </IconButton>
                    {matchesDesktop &&
                      <IconButton color="inherit" onClick={toggleDrawer(!open)}>
                        {
                        open ? <Box sx={{ background: 'var(--color-background-mediumcolor)', borderRadius: '6px', width: '32px', height: '32px', px: '6px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                            <ViewSidebarIcon aria-label="close sidebar" />
                          </Box> : <ViewSidebarIcon aria-label="show sidebar" />
                        }
                      </IconButton>
                    }
                  </Box>
                </Toolbar>
              }
              {
                (wallet?.address && ownerArray?.length && !ownerArray.includes(wallet?.address!)) ?
                  <Container fixed sx={{ height: '100vh', width: '100vw' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                      }}
                    >
                      <Typography variant="h4">
                        You are not a signer on this safe.
                      </Typography>
                    </Box>
                  </Container>
                  :
                  !wallet?.address || (!safeAddress && !safeLoading) ?
                  <Container fixed sx={{ height: 'calc(100vh - var(--header-height))' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                      }}
                    >
                      <Typography variant='h5' p={3}>Please add or select a chat from the sidebar</Typography>
                    </Box>
                  </Container>
                :
                wallet?.address && <ChatWrapper display={selectedValue} drawerWidth={drawerWidth} drawerOpen={open} />
              }
          
            </Box>
          
          </Box>
        </Main>
        {matchesDesktop &&
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                bgcolor: 'var(--color-background-papercolor)',
                boxSizing: 'border-box',
                height: 'calc(100vh - var(--header-height) - 24px)',
                top: 'var(--header-height)',
                margin: '12px 0',
                filter: 'drop-shadow(0 3px 6px #00000010)',
                borderRadius: '10px 0 0 10px',
                border: '0px',
              },
            }}
            variant="persistent"
            anchor="right"
            open={open}
          >
            <ChatOverview owners={owners} />
          </Drawer>
        }
      </Box>
    </>
  )
}

export default Chat
