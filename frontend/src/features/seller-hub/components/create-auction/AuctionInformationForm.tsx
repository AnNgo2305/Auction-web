import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Controller,
  type FieldErrors,
  type UseFormRegister,
  type Control,
} from 'react-hook-form';
import type { CreateAuctionBody } from '@/features/auction/schemas/create-auction.schema';
import { CalendarClock, DollarSign, Gavel } from 'lucide-react';
import { format } from 'date-fns';
import { useAuctionStore } from '@/shared/stores/auction.store';
import type { ChangeEvent } from 'react';

type AuctionInformationFormProps = {
  register: UseFormRegister<CreateAuctionBody>;
  control: Control<CreateAuctionBody>;
  errors: FieldErrors<CreateAuctionBody>;
};

export function AuctionInformationForm({
  register,
  control,
  errors,
}: AuctionInformationFormProps) {
  const { updateBasicInformation } = useAuctionStore();

  const handleDateChange = (
    date: Date | undefined,
    currentValue: string,
    onChange: (value: string) => void,
    fieldName: 'startTime' | 'endTime',
  ) => {
    if (!date) return;

    const current = currentValue ? new Date(currentValue) : new Date();
    date.setHours(current.getHours(), current.getMinutes(), 0, 0);

    const value = date.toISOString();
    onChange(value);
    updateBasicInformation({ [fieldName]: value });
  };

  const handleTimeChange = (
    time: string,
    currentValue: string,
    onChange: (value: string) => void,
    fieldName: 'startTime' | 'endTime',
  ) => {
    if (!currentValue) return;

    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(currentValue);
    if (hours) {
      date.setHours(hours, minutes, 0, 0);
    }

    const value = date.toISOString();
    onChange(value);
    updateBasicInformation({ [fieldName]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Auction Information</CardTitle>
        <CardDescription>
          Set the basic information, schedule, and pricing for your auction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel
              htmlFor="title"
              className="text-sm font-semibold tracking-wide"
            >
              Auction Title
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Gavel className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="title"
                placeholder="e.g. Sony WH-1000XM5 Auction"
                className="h-11"
                {...register('title', {
                  onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    updateBasicInformation({
                      title: event.target.value,
                    });
                  },
                })}
              />
            </InputGroup>
            <FieldDescription className="text-muted-foreground text-xs">
              Enter the title displayed to bidders.
            </FieldDescription>
            {errors.title && (
              <FieldError className="text-xs leading-tight">
                {errors.title.message}
              </FieldError>
            )}
          </Field>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel
                  htmlFor="startTime"
                  className="text-sm font-semibold tracking-wide"
                >
                  Start Time
                </FieldLabel>
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field }) => {
                    const selectedDate = field.value
                      ? new Date(field.value)
                      : undefined;
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="startTime"
                            type="button"
                            variant="outline"
                            className="h-11 w-full justify-start text-left font-normal"
                          >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            {selectedDate
                              ? format(selectedDate, 'PPP p')
                              : 'Select start time'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) =>
                              handleDateChange(
                                date,
                                field.value,
                                field.onChange,
                                'startTime',
                              )
                            }
                          />
                          <div className="border-t p-3">
                            <Input
                              type="time"
                              value={
                                selectedDate
                                  ? format(selectedDate, 'HH:mm')
                                  : ''
                              }
                              onChange={(event) =>
                                handleTimeChange(
                                  event.target.value,
                                  field.value,
                                  field.onChange,
                                  'startTime',
                                )
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                <FieldDescription className="text-muted-foreground text-xs">
                  When the auction becomes available to bidders.
                </FieldDescription>
                {errors.startTime && (
                  <FieldError className="text-xs leading-tight">
                    {errors.startTime.message}
                  </FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="endTime"
                  className="text-sm font-semibold tracking-wide"
                >
                  End Time
                </FieldLabel>
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field }) => {
                    const selectedDate = field.value
                      ? new Date(field.value)
                      : undefined;

                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="endTime"
                            type="button"
                            variant="outline"
                            className="h-11 w-full justify-start text-left font-normal"
                          >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            {selectedDate
                              ? format(selectedDate, 'PPP p')
                              : 'Select end time'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) =>
                              handleDateChange(
                                date,
                                field.value,
                                field.onChange,
                                'endTime',
                              )
                            }
                          />
                          <div className="border-t p-3">
                            <Input
                              type="time"
                              value={
                                selectedDate
                                  ? format(selectedDate, 'HH:mm')
                                  : ''
                              }
                              onChange={(event) =>
                                handleTimeChange(
                                  event.target.value,
                                  field.value,
                                  field.onChange,
                                  'endTime',
                                )
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                <FieldDescription className="text-muted-foreground text-xs">
                  When the auction ends.
                </FieldDescription>
                {errors.endTime && (
                  <FieldError className="text-xs leading-tight">
                    {errors.endTime.message}
                  </FieldError>
                )}
              </Field>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel
                htmlFor="startingPrice"
                className="text-sm font-semibold tracking-wide"
              >
                Starting Price
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <DollarSign className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="startingPrice"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 100000"
                  className="h-11"
                  {...register('startingPrice', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value),

                    onChange: (event: ChangeEvent<HTMLInputElement>) => {
                      updateBasicInformation({
                        startingPrice:
                          event.target.value === ''
                            ? undefined
                            : Number(event.target.value),
                      });
                    },
                  })}
                />
              </InputGroup>
              <FieldDescription className="text-muted-foreground text-xs">
                The initial price when the auction starts.
              </FieldDescription>
              {errors.startingPrice && (
                <FieldError className="text-xs leading-tight">
                  {errors.startingPrice.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel
                htmlFor="minimumBidIncrement"
                className="text-sm font-semibold tracking-wide"
              >
                Minimum Bid Increment
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <DollarSign className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="minimumBidIncrement"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 10000"
                  className="h-11"
                  {...register('minimumBidIncrement', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value),

                    onChange: (event: ChangeEvent<HTMLInputElement>) => {
                      updateBasicInformation({
                        minimumBidIncrement:
                          event.target.value === ''
                            ? undefined
                            : Number(event.target.value),
                      });
                    },
                  })}
                />
              </InputGroup>
              <FieldDescription className="text-muted-foreground text-xs">
                The minimum amount bidders must increase the current price.
              </FieldDescription>
              {errors.minimumBidIncrement && (
                <FieldError className="text-xs leading-tight">
                  {errors.minimumBidIncrement.message}
                </FieldError>
              )}
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}