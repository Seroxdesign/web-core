import { useMemo, useState } from 'react'
import { Box } from '@mui/material'
import EnhancedTable from '@/components/common/EnhancedTable'
import type { AddressEntry } from '@/components/address-book/EntryDialog'
import EntryDialog from '@/components/address-book/EntryDialog'
import ExportDialog from '@/components/address-book/ExportDialog'
import ImportDialog from '@/components/address-book/ImportDialog'
import EditIcon from '@/public/images/common/edit.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import RemoveDialog from '@/components/address-book/RemoveDialog'
import EthHashInfo from '@/components/common/EthHashInfo'
import AddressBookHeader from '../AddressBookHeader'
import Track from '@/components/common/Track'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import SvgIcon from '@mui/material/SvgIcon'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoEntriesIcon from '@/public/images/address-book/no-entries.svg'
import { useCurrentChain } from '@/hooks/useChains'
import tableCss from '@/components/common/EnhancedTable/styles.module.css'
import TokenTransferModal from '@/components/tx/modals/TokenTransferModal'
import { SendAssetsField } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import CheckWallet from '@/components/common/CheckWallet'
import useAddressBookByChain from '@/hooks/useAddressBookByChain'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

export enum ModalType {
  EXPORT = 'export',
  IMPORT = 'import',
  ENTRY = 'entry',
  REMOVE = 'remove',
}

const defaultOpen = {
  [ModalType.EXPORT]: false,
  [ModalType.IMPORT]: false,
  [ModalType.ENTRY]: false,
  [ModalType.REMOVE]: false,
}

const AddressBookTable = () => {
  const chain = useCurrentChain()
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const [searchQuery, setSearchQuery] = useState('')
  const [defaultValues, setDefaultValues] = useState<AddressEntry | undefined>(undefined)
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>()

  const handleOpenModal = (type: keyof typeof open) => () => {
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleOpenModalWithValues = (modal: ModalType, address: string, name: string) => {
    setDefaultValues({ address, name })
    handleOpenModal(modal)()
  }

  const handleClose = () => {
    setOpen(defaultOpen)
    setDefaultValues(undefined)
  }

  const addressBook = useAddressBookByChain()
  const addressBookEntries = Object.entries(addressBook)
  const filteredEntries = useMemo(() => {
    if (!searchQuery) {
      return addressBookEntries
    }

    const query = searchQuery.toLowerCase()
    return addressBookEntries.filter(([address, name]) => {
      return address.toLowerCase().includes(query) || name.toLowerCase().includes(query)
    })
  }, [addressBookEntries, searchQuery])

  const rows = filteredEntries.map(([address, name]) => ({
    cells: {
      name: {
        rawValue: name,
        content: name,
      },
      address: {
        rawValue: address,
        content: <EthHashInfo address={address} showName={false} shortAddress={false} hasExplorer showCopyButton />,
      },
      actions: {
        rawValue: '',
        sticky: true,
        content: (
          <div className={tableCss.actions}>
            <Track {...ADDRESS_BOOK_EVENTS.EDIT_ENTRY}>
              <Tooltip title="Edit entry" placement="top">
                <IconButton onClick={() => handleOpenModalWithValues(ModalType.ENTRY, address, name)} size="small">
                  <SvgIcon component={EditIcon} inheritViewBox color="border" fontSize="small" />
                </IconButton>
              </Tooltip>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.DELETE_ENTRY}>
              <Tooltip title="Delete entry" placement="top">
                <IconButton onClick={() => handleOpenModalWithValues(ModalType.REMOVE, address, name)} size="small">
                  <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                </IconButton>
              </Tooltip>
            </Track>

            <CheckWallet>
              {(isOk) => (
                <Track {...ADDRESS_BOOK_EVENTS.SEND}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => setSelectedAddress(address)}
                    disabled={!isOk}
                  >
                    Send
                  </Button>
                </Track>
              )}
            </CheckWallet>
          </div>
        ),
      },
    },
  }))

  return (
    <>
      <AddressBookHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main>
        {filteredEntries.length > 0 ? (
          //@ts-ignore
          <EnhancedTable rows={rows} headCells={headCells} mobileVariant />
        ) : (
          <Box bgcolor="background.paper" borderRadius={1}>
            <PagePlaceholder
              img={<NoEntriesIcon />}
              text={`No entries found${chain ? ` on ${chain.chainName}` : ''}`}
            />
          </Box>
        )}
      </main>

      {open[ModalType.EXPORT] && <ExportDialog handleClose={handleClose} />}

      {open[ModalType.IMPORT] && <ImportDialog handleClose={handleClose} />}

      {open[ModalType.ENTRY] && (
        <EntryDialog
          handleClose={handleClose}
          defaultValues={defaultValues}
          disableAddressInput={Boolean(defaultValues?.name)}
        />
      )}

      {open[ModalType.REMOVE] && <RemoveDialog handleClose={handleClose} address={defaultValues?.address || ''} />}

      {/* Send funds modal */}
      {selectedAddress && (
        <TokenTransferModal
          onClose={() => setSelectedAddress(undefined)}
          initialData={[{ [SendAssetsField.recipient]: selectedAddress }]}
        />
      )}
    </>
  )
}

export default AddressBookTable
