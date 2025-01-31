import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import TxModal from '@/components/tx/TxModal'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import useSafeInfo from '@/hooks/useSafeInfo'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import { IconButton, SvgIcon, Tooltip } from '@mui/material'
import { useState } from 'react'
import { ReviewRemoveOwnerTxStep } from './DialogSteps/ReviewRemoveOwnerTxStep'
import { ReviewSelectedOwnerStep } from './DialogSteps/ReviewSelectedOwnerStep'
import { SetThresholdStep } from './DialogSteps/SetThresholdStep'
import type { OwnerData } from './DialogSteps/types'

export type RemoveOwnerData = {
  removedOwner: OwnerData
  threshold: number
}

const RemoveOwnerSteps: TxStepperProps['steps'] = [
  {
    label: 'Remove owner',
    render: (data, onSubmit) => <ReviewSelectedOwnerStep data={data as RemoveOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Set threshold',
    render: (data, onSubmit) => <SetThresholdStep data={data as RemoveOwnerData} onSubmit={onSubmit} />,
  },
  {
    label: 'Review transaction',
    render: (data, onSubmit) => <ReviewRemoveOwnerTxStep data={data as RemoveOwnerData} onSubmit={onSubmit} />,
  },
]

export const RemoveOwnerDialog = ({ owner }: { owner: OwnerData }) => {
  const [open, setOpen] = useState(false)

  const { safe } = useSafeInfo()

  const handleClose = () => setOpen(false)

  const showRemoveOwnerButton = safe.owners.length > 1

  if (!showRemoveOwnerButton) {
    return null
  }

  const initialModalData: RemoveOwnerData = {
    threshold: Math.min(safe.threshold, safe.owners.length - 1),
    removedOwner: owner,
  }

  return (
    <div>
      <CheckWallet>
        {(isOk) => (
          <Track {...SETTINGS_EVENTS.SETUP.REMOVE_OWNER}>
            <Tooltip title="Remove owner">
              <IconButton onClick={() => setOpen(true)} size="small" disabled={!isOk}>
                <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
              </IconButton>
            </Tooltip>
          </Track>
        )}
      </CheckWallet>

      {open && <TxModal wide onClose={handleClose} steps={RemoveOwnerSteps} initialData={[initialModalData]} />}
    </div>
  )
}
